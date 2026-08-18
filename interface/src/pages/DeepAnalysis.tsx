import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, Send, User } from "lucide-react";
import Navbar from "../components/Navbar";
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
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />

      {/* Header */}
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3 flex items-start justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">
            Deep Analysis
          </h1>
          <p className="text-gray-500 text-sm">
            A short AI-guided conversation, tailored to your answers.
          </p>
        </div>
        {!finished && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-1.5 whitespace-nowrap mt-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Question {answeredCount + 1}
          </div>
        )}
      </div>

      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 space-y-6">
          {turns.map((turn, i) => {
            const isLast = i === turns.length - 1;
            return (
              <div key={i} className="space-y-3">
                <div className="flex items-start gap-3">
                  <BotAvatar />
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] sm:max-w-md text-gray-900 text-[15px] sm:text-base leading-relaxed shadow-sm break-words">
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
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] sm:max-w-md text-[15px] sm:text-base leading-relaxed shadow-sm break-words whitespace-pre-wrap">
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
            <div className="mt-4 pb-6">
              <ThankYouCard />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed input bar */}
      {awaitingAnswer && !finished && !currentIsTyping && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-3">
            <div className="border border-gray-300 rounded-2xl p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
              <textarea
                autoFocus
                rows={1}
                className="flex-1 px-3 py-2.5 text-[15px] sm:text-base focus:outline-none bg-transparent resize-none max-h-32"
                placeholder="Type your answer…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
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
            <p className="text-[11px] text-gray-400 text-center mt-2">
              Press Enter to send, Shift+Enter for a new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeepAnalysisChat;