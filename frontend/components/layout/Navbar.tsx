"use client";

import React from "react";
import { AgentState, User } from "@/types";
import { Brain, Menu, Sparkles } from "lucide-react";

interface NavbarProps {
  sessionTitle?: string;
  currentState?: AgentState;
  user: User | null;
  onToggleSidebar?: () => void;
  onToggleContext?: () => void;
}

const STATE_COLORS: Record<AgentState, { bg: string; text: string; border: string }> = {
  INTAKE: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  ELICIT_REASONING: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  WAITING_FOR_STUDENT: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  ANALYZE_ATTEMPT: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  GUIDED_INTERVENTION: { bg: "bg-neon-pink/10", text: "text-neon-pink", border: "border-neon-pink/20" },
  VALIDATE_UNDERSTANDING: { bg: "bg-siren-500/10", text: "text-siren-400", border: "border-siren-500/20" },
  COMPLETED: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};

export function Navbar({
  sessionTitle = "New Doubt Session",
  currentState = "INTAKE",
  user,
  onToggleSidebar,
  onToggleContext,
}: NavbarProps) {
  const stateStyle = STATE_COLORS[currentState] || STATE_COLORS.INTAKE;

  return (
    <header className="h-14 bg-[#08090d] border-b border-zinc-800/80 px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-siren-500 to-neon-pink flex items-center justify-center text-white shadow-siren">
            <Brain className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
            Bhasha
          </span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 hidden sm:inline">
            Socratic
          </span>
        </div>
      </div>

      {/* Middle: Session Title & Stage Badge */}
      <div className="flex items-center gap-2 max-w-md truncate">
        <span className="text-xs font-medium text-zinc-300 truncate">
          {sessionTitle}
        </span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${stateStyle.bg} ${stateStyle.text} ${stateStyle.border}`}
        >
          {currentState}
        </span>
      </div>

      {/* Right: User / Context Toggle */}
      <div className="flex items-center gap-3">
        {onToggleContext && (
          <button
            onClick={onToggleContext}
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-md border border-zinc-800 hover:border-zinc-700 transition-colors hidden lg:flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-siren-400" />
            <span>Guide</span>
          </button>
        )}

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-200 font-semibold">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "S"}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

