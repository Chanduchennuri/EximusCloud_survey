import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, CheckCircle2, Clock, MessageSquare, ClipboardList } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getAnalyticsSummary,
  getAnalyticsByQuestion,
  getRespondents,
} from "../api/research";
import type {
  AnalyticsSummary,
  QuestionAnalytics,
  RespondentRow,
} from "../types/api";

const STUDY_ID = 1;

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function RespondentsTable({ respondents }: { respondents: RespondentRow[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-10">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Respondents</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Mode</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Answers</th>
              <th className="px-6 py-3 font-medium">Started</th>
            </tr>
          </thead>
          <tbody>
            {respondents.map((r) => (
              <tr key={r.session_id} className="border-b border-gray-50 last:border-0">
                <td className="px-6 py-3">
                  <div className="text-gray-900 font-medium">{r.name || "—"}</div>
                  <div className="text-gray-400 text-xs">{r.email || "—"}</div>
                </td>
                <td className="px-6 py-3 text-gray-700">{r.company || "—"}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.mode === "generic"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {r.mode === "generic" ? "Quick Survey" : "Deep Analysis"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "completed"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {r.status === "completed" ? "Completed" : "In progress"}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-700">{r.answer_count}</td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(r.started_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionAnalytics }) {
  if (question.question_type === "text") {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <p className="text-xs text-gray-400 mb-1">{question.category}</p>
        <h3 className="font-semibold text-gray-900 mb-4">
          {question.question_text}
        </h3>
        {question.raw_answers && question.raw_answers.length > 0 ? (
          <div className="space-y-2">
            {question.raw_answers.map((answer, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-700"
              >
                {answer}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No responses yet.</p>
        )}
      </div>
    );
  }

  const chartData = Object.entries(question.option_counts ?? {}).map(
    ([name, count]) => ({ name, count })
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <p className="text-xs text-gray-400 mb-1">{question.category}</p>
      <h3 className="font-semibold text-gray-900 mb-1">
        {question.question_text}
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        {question.total_responses} response
        {question.total_responses === 1 ? "" : "s"}
      </p>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={Math.max(120, chartData.length * 40)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-400">No responses yet.</p>
      )}
    </div>
  );
}

function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [questions, setQuestions] = useState<QuestionAnalytics[]>([]);
  const [respondents, setRespondents] = useState<RespondentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, questionsRes, respondentsRes] = await Promise.all([
          getAnalyticsSummary(STUDY_ID),
          getAnalyticsByQuestion(STUDY_ID),
          getRespondents(STUDY_ID),
        ]);
        setSummary(summaryRes);
        setQuestions(questionsRes);
        setRespondents(respondentsRes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          Research Dashboard
        </h1>
        <p className="text-gray-500 mb-8">
          Live response data for the CloudPulse study.
        </p>

        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            <SummaryCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              label="Total sessions"
              value={summary.total_sessions}
            />
            <SummaryCard
              icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
              label="Completed"
              value={summary.completed_sessions}
            />
            <SummaryCard
              icon={<Clock className="w-5 h-5 text-blue-600" />}
              label="In progress"
              value={summary.in_progress_sessions}
            />
            <SummaryCard
              icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
              label="Quick survey"
              value={summary.generic_sessions}
            />
            <SummaryCard
              icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
              label="Deep analysis"
              value={summary.deep_analysis_sessions}
            />
          </div>
        )}

        {respondents.length > 0 && (
          <RespondentsTable respondents={respondents} />
        )}

        <div className="space-y-6">
          {questions.map((q) => (
            <QuestionCard key={q.question_id} question={q} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;