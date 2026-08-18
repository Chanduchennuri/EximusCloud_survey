import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getNextQuestion, submitAnswer } from "../api/research";
import type { QuestionResponse } from "../types/api";
import ThankYouCard from "../components/ThankyouCard";

const OTHER_VALUE = "__other__";

function getDisplayOptions(question: QuestionResponse): string[] {
  return (question.options ?? []).filter(
    (opt) => opt.trim().toLowerCase() !== "other"
  );
}

function GenericForm() {
  const { sessionId } = useParams();
  const id = Number(sessionId);

  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [singleValue, setSingleValue] = useState("");
  const [multiValues, setMultiValues] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [textValue, setTextValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetInputs() {
    setSingleValue("");
    setMultiValues([]);
    setOtherText("");
    setTextValue("");
  }

  async function loadNext() {
    setLoading(true);
    setError(null);
    try {
      const q = await getNextQuestion(id);
      setQuestion(q);
      resetInputs();
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function toggleMulti(value: string) {
    setMultiValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function buildAnswer(): string | string[] | null {
    if (!question) return null;

    switch (question.question_type) {
      case "single_select":
      case "scale": {
        if (!singleValue) return null;
        if (singleValue === OTHER_VALUE) {
          return otherText.trim() ? `Other: ${otherText.trim()}` : null;
        }
        return singleValue;
      }
      case "multi_select":
      case "scenario": {
        const values = [...multiValues];
        if (values.includes(OTHER_VALUE)) {
          const idx = values.indexOf(OTHER_VALUE);
          if (!otherText.trim()) return null;
          values[idx] = `Other: ${otherText.trim()}`;
        }
        return values.length > 0 ? values : null;
      }
      case "percentage_range": {
        return singleValue || null;
      }
      case "text":
      default: {
        return textValue.trim() || null;
      }
    }
  }

  async function handleSubmit() {
    if (!question) return;
    const answer = buildAnswer();
    if (answer === null || (Array.isArray(answer) && answer.length === 0)) {
      setError("Please answer before continuing.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitAnswer(id, answer, { questionId: question.id });
      await loadNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  function renderInput() {
    if (!question) return null;
    const displayOptions = getDisplayOptions(question);

    switch (question.question_type) {
      case "single_select":
      case "percentage_range":
        return (
          <div className="space-y-3">
            {displayOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
              >
                <input
                  type="radio"
                  name="answer"
                  value={opt}
                  checked={singleValue === opt}
                  onChange={() => setSingleValue(opt)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-800">{opt}</span>
              </label>
            ))}
            {question.allow_other && (
              <label className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="answer"
                  value={OTHER_VALUE}
                  checked={singleValue === OTHER_VALUE}
                  onChange={() => setSingleValue(OTHER_VALUE)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-800">Other</span>
                {singleValue === OTHER_VALUE && (
                  <input
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please specify"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                  />
                )}
              </label>
            )}
          </div>
        );

      case "multi_select":
      case "scenario":
        return (
          <div className="space-y-3">
            {displayOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
              >
                <input
                  type="checkbox"
                  checked={multiValues.includes(opt)}
                  onChange={() => toggleMulti(opt)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-800">{opt}</span>
              </label>
            ))}
            {question.allow_other && (
              <label className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="checkbox"
                  checked={multiValues.includes(OTHER_VALUE)}
                  onChange={() => toggleMulti(OTHER_VALUE)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-800">Other</span>
                {multiValues.includes(OTHER_VALUE) && (
                  <input
                    className="flex-1 border border-gray-300 rounded px-3 py-1.5 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please specify"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                  />
                )}
              </label>
            )}
          </div>
        );

      case "scale":
        return (
          <div className="flex gap-3">
            {displayOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSingleValue(opt)}
                className={`w-14 h-14 rounded-full border-2 font-semibold text-lg transition ${
                  singleValue === opt
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-600 hover:border-blue-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case "text":
      default:
        return (
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-28 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your answer"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        {done ? (
  <ThankYouCard />
) : loading ? (
          <p className="text-gray-500">Loading question…</p>
        ) : (
          question && (
            <div className="bg-white border-t-4 border-blue-500 border-x border-b border-gray-200 rounded-2xl p-6 sm:p-8">
              <p className="text-xs text-gray-400 mb-2">
                Question {question.display_order}
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 leading-snug">
                {question.question_text}
              </h2>

              {renderInput()}

              {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

              <div className="flex justify-end mt-8">
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Next"}
                </button>
              </div>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}

export default GenericForm;