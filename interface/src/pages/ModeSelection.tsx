import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Sparkles,
  UserRound,
  Mail,
  Building2,
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createSession } from "../api/research";
import type { Respondent, SessionMode } from "../types/api";

const STUDY_ID = 1;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ModeSelection() {
  const navigate = useNavigate();
  const [respondent, setRespondent] = useState<Respondent>({
    name: "",
    email: "",
    company: "",
    role: "",
    company_size: "",
  });
  const [selectedMode, setSelectedMode] = useState<SessionMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  function updateField(field: keyof Respondent, value: string) {
    setRespondent((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!respondent.name.trim()) return "Please enter your name.";
    if (!respondent.email.trim() || !EMAIL_REGEX.test(respondent.email)) {
      return "Please enter a valid email address.";
    }
    if (!respondent.company.trim()) return "Please enter your company.";
    if (!selectedMode) return "Please choose how you'd like to answer.";
    return null;
  }

  async function handleContinue() {
    setTouched(true);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const session = await createSession(STUDY_ID, selectedMode!, respondent);
      navigate(
        selectedMode === "generic"
          ? `/session/${session.id}/generic`
          : `/session/${session.id}/deep-analysis`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't reach the server. Is the backend running?"
      );
      setLoading(false);
    }
  }

  const showFieldError = (condition: boolean) =>
    touched && condition ? "border-red-300 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
          CloudPulse Industry Research
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-10 leading-relaxed">
          We're studying how engineering and finance teams handle cloud cost
          management today. Your responses will directly shape a product
          built around real workflows, not assumptions — there are no wrong
          answers, and all data is used in aggregate, never shared
          individually.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-10 flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm sm:text-base text-gray-700">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
              1
            </span>
            Tell us a bit about you
          </div>
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
              2
            </span>
            Pick how you'd like to answer
          </div>
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
              3
            </span>
            Answer at your own pace
          </div>
        </div>

        {/* Respondent form */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">About you</h2>
          <span className="text-xs text-gray-400">
            Required fields marked <span className="text-red-500">*</span>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="relative">
            <UserRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              className={`w-full border rounded-lg pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 transition ${showFieldError(
                !respondent.name.trim()
              )}`}
              placeholder="Name *"
              value={respondent.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              className={`w-full border rounded-lg pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 transition ${showFieldError(
                !respondent.email.trim() || !EMAIL_REGEX.test(respondent.email)
              )}`}
              placeholder="Email *"
              value={respondent.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          <div className="relative">
            <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              className={`w-full border rounded-lg pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 transition ${showFieldError(
                !respondent.company.trim()
              )}`}
              placeholder="Company *"
              value={respondent.company}
              onChange={(e) => updateField("company", e.target.value)}
            />
          </div>

          <div className="relative">
            <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Role"
              value={respondent.role}
              onChange={(e) => updateField("role", e.target.value)}
            />
          </div>

          <div className="relative sm:col-span-2">
            <Users className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Company size (e.g. 11-50)"
              value={respondent.company_size}
              onChange={(e) => updateField("company_size", e.target.value)}
            />
          </div>
        </div>

        {/* Mode selection */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          How would you like to answer? <span className="text-red-500">*</span>
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setSelectedMode("generic")}
            className={`relative text-left border-2 rounded-2xl p-6 sm:p-7 bg-white transition ${
              selectedMode === "generic"
                ? "border-blue-500 shadow-md"
                : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            {selectedMode === "generic" && (
              <CheckCircle2 className="w-5 h-5 text-blue-600 absolute top-5 right-5" />
            )}
            <ClipboardList className="w-6 h-6 text-blue-600 mb-3" strokeWidth={2} />
            <div className="text-blue-600 font-medium mb-1 text-sm">
              Quick Survey
            </div>
            <div className="text-gray-900 font-bold text-xl mb-2">
              12 guided questions
            </div>
            <p className="text-sm sm:text-base text-gray-500">
              ~5 minutes. Multiple choice and short answers, same for every
              respondent.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode("deep_analysis")}
            className={`relative text-left border-2 rounded-2xl p-6 sm:p-7 bg-white transition ${
              selectedMode === "deep_analysis"
                ? "border-blue-500 shadow-md"
                : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            {selectedMode === "deep_analysis" && (
              <CheckCircle2 className="w-5 h-5 text-blue-600 absolute top-5 right-5" />
            )}
            <Sparkles className="w-6 h-6 text-blue-600 mb-3" strokeWidth={2} />
            <div className="text-blue-600 font-medium mb-1 text-sm">
              Deep Analysis
            </div>
            <div className="text-gray-900 font-bold text-xl mb-2">
              AI-guided conversation
            </div>
            <p className="text-sm sm:text-base text-gray-500">
              ~8-10 minutes. Adapts each follow-up question to what you
              share.
            </p>
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 flex items-center gap-1.5">
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-medium text-base hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Starting…" : "Continue"}
          {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
        </button>
      </main>

      <Footer />
    </div>
  );
}

export default ModeSelection;