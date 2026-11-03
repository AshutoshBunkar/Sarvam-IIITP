export type AgentState =
  | "INTAKE"
  | "ELICIT_REASONING"
  | "WAITING_FOR_STUDENT"
  | "ANALYZE_ATTEMPT"
  | "GUIDED_INTERVENTION"
  | "VALIDATE_UNDERSTANDING"
  | "COMPLETED";

export type NaturalLanguage = "English" | "Hindi" | "Marathi" | "Hinglish";
export type ProgrammingLanguage = "python" | "cpp";

export interface LearnerProfile {
  id: string;
  preferred_language: NaturalLanguage;
  programming_language: ProgrammingLanguage;
  experience_level: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  profile?: LearnerProfile;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  code_snippet?: string | null;
  agent_state?: AgentState | null;
  message_metadata?: Record<string, any>;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  title: string;
  programming_language: ProgrammingLanguage;
  natural_language: NaturalLanguage;
  current_state: AgentState;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface SessionSummary {
  id: string;
  title: string;
  programming_language: ProgrammingLanguage;
  natural_language: NaturalLanguage;
  current_state: AgentState;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface TurnResponse {
  session_id: string;
  assistant_message: string;
  agent_state: AgentState;
  awaiting_student: boolean;
  language: string;
  code_blocks: string[];
  session_completed: boolean;
  user_message_id: string;
  assistant_message_id: string;
}

