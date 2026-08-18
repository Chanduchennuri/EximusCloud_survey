export type SessionMode = "generic" | "deep_analysis";

export interface Respondent {
  name: string;
  email: string;
  company: string;
  role: string;
  company_size: string;
}

export interface Session {
  id: number;
  study_id: number;
  mode: SessionMode;
  status: string;
  started_at: string;
  completed_at: string | null;
}

export interface QuestionResponse {
  id: number;
  question_text: string;
  display_order: number;
  question_type:
    | "single_select"
    | "multi_select"
    | "scale"
    | "percentage_range"
    | "text"
    | "scenario";
  options: string[] | null;
  required: boolean;
  allow_other: boolean;
}
export interface AINextQuestion {
  next_question: string | null;
  reason: string;
  should_continue: boolean;
}

export interface ConversationTurn {
  id: number;
  session_id: number;
  question_id: number | null;
  question_text: string;
  user_answer: string;
  created_at: string;
}