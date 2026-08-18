import type {
  Respondent,
  Session,
  SessionMode,
  QuestionResponse,
  AINextQuestion,
  ConversationTurn,
} from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE;

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.detail || "Request failed");
  }
  return res.json();
}

export function createSession(
  studyId: number,
  mode: SessionMode,
  respondent: Respondent
): Promise<Session> {
  return fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ study_id: studyId, mode, respondent }),
  }).then(handle<Session>);
}

export function getNextQuestion(sessionId: number): Promise<QuestionResponse> {
  return fetch(`${API_BASE}/sessions/${sessionId}/next-question`).then(
    handle<QuestionResponse>
  );
}

export function submitAnswer(
  sessionId: number,
  answer: string | string[],
  opts: { questionId?: number; questionText?: string }
): Promise<ConversationTurn> {
  return fetch(`${API_BASE}/sessions/${sessionId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question_id: opts.questionId ?? null,
      question_text: opts.questionText ?? null,
      answer,
    }),
  }).then(handle<ConversationTurn>);
}
export function getDeepAnalysisQuestion(
  sessionId: number
): Promise<AINextQuestion> {
  return fetch(
    `${API_BASE}/sessions/${sessionId}/deep-analysis/next-question`,
    { method: "POST" }
  ).then(handle<AINextQuestion>);
}