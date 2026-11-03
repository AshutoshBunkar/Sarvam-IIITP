"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  AgentState,
  Message,
  NaturalLanguage,
  ProgrammingLanguage,
  Session,
  SessionSummary,
} from "@/types";

export function useSession() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default preferences
  const [programmingLanguage, setProgrammingLanguage] = useState<ProgrammingLanguage>("python");
  const [naturalLanguage, setNaturalLanguage] = useState<NaturalLanguage>("English");

  // Load sessions list
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const list = await api.listSessions();
      setSessions(list);
      return list;
    } catch (err: any) {
      setError(err.message || "Failed to load sessions");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Select and load a specific session
  const selectSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await api.getSession(sessionId);
      setActiveSession(session);
      setProgrammingLanguage(session.programming_language);
      setNaturalLanguage(session.natural_language);

      const msgs = await api.getSessionMessages(sessionId);
      setMessages(msgs);
    } catch (err: any) {
      setError(err.message || "Failed to load session details");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new session
  const createNewSession = async (
    title: string = "New Doubt Session",
    progLang: ProgrammingLanguage = programmingLanguage,
    natLang: NaturalLanguage = naturalLanguage
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const newSess = await api.createSession({
        title,
        programming_language: progLang,
        natural_language: natLang,
      });

      setActiveSession(newSess);
      setMessages([]);
      await loadSessions();
      return newSess;
    } catch (err: any) {
      setError(err.message || "Failed to create session");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit a turn to the Socratic agent
  const sendTurn = async (userMessage: string, codeSnippet?: string) => {
    let currentSessionId = activeSession?.id;

    // If no active session, create one first
    if (!currentSessionId) {
      const created = await createNewSession(
        "New Doubt Session",
        programmingLanguage,
        naturalLanguage
      );
      currentSessionId = created.id;
    }

    try {
      setIsSending(true);
      setError(null);

      // Optimistically append user message to UI
      const tempUserMsg: Message = {
        id: "temp-" + Date.now(),
        session_id: currentSessionId,
        role: "user",
        content: userMessage,
        code_snippet: codeSnippet || null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // Call API
      const turnRes = await api.submitTurn(currentSessionId, {
        user_message: userMessage,
        code_snippet: codeSnippet || null,
        programming_language: programmingLanguage,
        natural_language: naturalLanguage,
      });

      // Append assistant message
      const assistantMsg: Message = {
        id: turnRes.assistant_message_id,
        session_id: currentSessionId,
        role: "assistant",
        content: turnRes.assistant_message,
        code_snippet: turnRes.code_blocks?.join("\n\n") || null,
        agent_state: turnRes.agent_state,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update active session state
      if (activeSession) {
        setActiveSession({
          ...activeSession,
          current_state: turnRes.agent_state,
        });
      }

      // Refresh sessions list
      loadSessions();
    } catch (err: any) {
      setError(err.message || "Failed to process doubt");
    } finally {
      setIsSending(false);
    }
  };

  return {
    sessions,
    activeSession,
    messages,
    isLoading,
    isSending,
    error,
    programmingLanguage,
    setProgrammingLanguage,
    naturalLanguage,
    setNaturalLanguage,
    loadSessions,
    selectSession,
    createNewSession,
    sendTurn,
  };
}

