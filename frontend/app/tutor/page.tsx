"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContextPanel } from "@/components/layout/ContextPanel";
import { ChatThread } from "@/components/chat/ChatThread";
import { DoubtInput } from "@/components/chat/DoubtInput";
import { CodeEditorDrawer } from "@/components/editor/CodeEditorDrawer";
import { Loader2 } from "lucide-react";

export default function TutorPage() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const {
    sessions,
    activeSession,
    messages,
    isLoading: sessionLoading,
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
  } = useSession();

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorCode, setEditorCode] = useState("");

  // Initial load
  useEffect(() => {
    if (user) {
      loadSessions();
      if (user.profile?.preferred_language) {
        setNaturalLanguage(user.profile.preferred_language);
      }
      if (user.profile?.programming_language) {
        setProgrammingLanguage(user.profile.programming_language);
      }
    }
  }, [user]);

  // Handle sending doubt
  const handleSendTurn = async (messageText: string) => {
    const codeToSend = editorCode.trim() ? editorCode : undefined;
    await sendTurn(messageText, codeToSend);
    // Keep code in editor or clear based on preference; keep it so user can iterate
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060709] flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-siren-500" />
          <span className="text-xs font-mono">Loading Bhasha Tutor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#060709] text-pearl overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?.id || null}
        onSelectSession={selectSession}
        onNewSession={() => {
          createNewSession("New Doubt Session", programmingLanguage, naturalLanguage);
        }}
        naturalLanguage={naturalLanguage}
        onLanguageChange={setNaturalLanguage}
        user={user}
        onLogout={logout}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Navbar */}
        <Navbar
          sessionTitle={activeSession?.title || "New Doubt Session"}
          currentState={activeSession?.current_state || "INTAKE"}
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleContext={() => setIsContextOpen(!isContextOpen)}
        />

        {/* Error notification banner if any */}
        {error && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs flex justify-between items-center">
            <span>{error}</span>
          </div>
        )}

        {/* Center Split: Chat Thread + Monaco Editor */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Socratic Chat Thread */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <ChatThread
              messages={messages}
              isLoading={isSending}
              programmingLanguage={programmingLanguage}
              naturalLanguage={naturalLanguage}
            />

            {/* Input Bar */}
            <DoubtInput
              onSend={handleSendTurn}
              isLoading={isSending}
              onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
              isEditorOpen={isEditorOpen}
              hasCodeAttached={Boolean(editorCode.trim())}
            />
          </div>

          {/* Monaco Code Editor Drawer */}
          <CodeEditorDrawer
            isOpen={isEditorOpen}
            onClose={() => setIsEditorOpen(false)}
            code={editorCode}
            onChange={setEditorCode}
            language={programmingLanguage}
            onLanguageChange={setProgrammingLanguage}
          />
        </div>
      </div>

      {/* Right Context Panel */}
      <ContextPanel
        isOpen={isContextOpen}
        onClose={() => setIsContextOpen(false)}
        currentTopic={activeSession?.title || "New Doubt Session"}
        currentState={activeSession?.current_state || "INTAKE"}
        programmingLanguage={programmingLanguage}
        onLanguageChange={setProgrammingLanguage}
      />
    </div>
  );
}

