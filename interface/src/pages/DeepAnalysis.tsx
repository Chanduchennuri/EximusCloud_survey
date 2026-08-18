import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, Send, User } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TypewriterText from "../components/TypewriterText";
import { getDeepAnalysisQuestion, submitAnswer } from "../api/research";
import ThankYouCard from "../components/ThankyouCard";

interface ChatTurn {
  question: string;
  answer?: string;
  typed?: boolean;
}

function BotAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
      <User className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-4">
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
    </div>
  );
}

function DeepAnalysisChat() {
  const { sessionId } = useParams();
  const id = Number(sessionId);

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  async function loadNext() {
    setLoading(true);
    setError(null);
    try {
      const res = await getDeepAnalysisQuestion(id);
      if (res.next_question) {
        setTurns((prev) => [
          ...prev,
          { question: res.next_question!, typed: false },
        ]);
      }
      if (!res.should_continue) {
        setFinished(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load question");
      setFinished(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [turns, loading]);

  async function handleSubmit() {
    const current = turns[turns.length - 1];
    if (!current || !answer.trim() || submitting) return;

    const submittedAnswer = answer;
    setSubmitting(true);
    setError(null);
    setAnswer("");

    try {
      await submitAnswer(id, submittedAnswer, { questionText: current.question });
      setTurns((prev) =>
        prev.map((t, i) =>
          i === prev.length - 1 ? { ...t, answer: submittedAnswer } : t
        )
      );
      await loadNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setAnswer(submittedAnswer);
    } finally {
      setSubmitting(false);
    }
  }

  function markTyped(index: number) {
    setTurns((prev) =>
      prev.map((t, i) => (i === index ? { ...t, typed: true } : t))
    );
  }

  const currentTurn = turns[turns.length - 1];
  const awaitingAnswer = currentTurn && currentTurn.answer === undefined;
  const currentIsTyping = currentTurn && !currentTurn.typed;
  const answeredCount = turns.filter((t) => t.answer !== undefined).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 flex-1 flex flex-col">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Deep Analysis
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              A short AI-guided conversation, tailored to your answers.
            </p>
          </div>
          {!finished && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1.5 whitespace-nowrap mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Question {answeredCount + 1}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          {turns.map((turn, i) => {
            const isLast = i === turns.length - 1;
            return (
              <div key={i} className="space-y-3">
                <div className="flex items-start gap-3">
                  <BotAvatar />
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] sm:max-w-md text-gray-900 text-[15px] sm:text-base leading-relaxed shadow-sm">
                    {isLast && !turn.typed ? (
                      <TypewriterText
                        text={turn.question}
                        onDone={() => markTyped(i)}
                      />
                    ) : (
                      turn.question
                    )}
                  </div>
                </div>

                {turn.answer !== undefined && (
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] sm:max-w-md text-[15px] sm:text-base leading-relaxed shadow-sm">
                      {turn.answer}
                    </div>
                    <UserAvatar />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <BotAvatar />
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}

          {finished && !loading && (
  <div className="mt-4">
    <ThankYouCard />
  </div>
)}

          <div ref={bottomRef} />
        </div>

        {awaitingAnswer && !finished && !currentIsTyping && (
          <div className="sticky bottom-4 mt-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-2 flex items-center gap-2 shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
              <input
                autoFocus
                className="flex-1 px-3 py-2.5 text-[15px] sm:text-base focus:outline-none bg-transparent"
                placeholder="Type your answer…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={submitting}
              />
              <button
                disabled={submitting || !answer.trim()}
                onClick={handleSubmit}
                className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition flex-shrink-0"
                aria-label="Send"
              >
                <Send className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            {error && <p className="text-red-600 text-sm mt-2 px-1">{error}</p>}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default DeepAnalysisChat;