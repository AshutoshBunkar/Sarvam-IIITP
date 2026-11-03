"use client";

import React from "react";
import { AgentState, ProgrammingLanguage } from "@/types";
import { Compass, HelpCircle, Info, Sparkles, X } from "lucide-react";

interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: string;
  currentState: AgentState;
  programmingLanguage: ProgrammingLanguage;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
}

const STAGE_EXPLANATIONS: Record<AgentState, { name: string; desc: string; tip: string }> = {
  INTAKE: {
    name: "Problem Intake",
    desc: "Bhasha is absorbing your problem description and identifying the core concept.",
    tip: "Be specific about what error you see or what behavior you expect.",
  },
  ELICIT_REASONING: {
    name: "Eliciting Reasoning",
    desc: "Bhasha is asking you to trace your logic or explain what a particular line does.",
    tip: "Walk through your code line by line with simple test values like 0 or 1.",
  },
  WAITING_FOR_STUDENT: {
    name: "Awaiting Reflection",
    desc: "The ball is in your court! Answer the guiding question to test your hypothesis.",
    tip: "It's completely fine to guess or share partial intuition.",
  },
  ANALYZE_ATTEMPT: {
    name: "Analyzing Attempt",
    desc: "Bhasha is examining your explanation to locate where the conceptual gap lies.",
    tip: "Notice whether the issue is conceptual (algorithm) or syntactic.",
  },
  GUIDED_INTERVENTION: {
    name: "Guided Intervention",
    desc: "Providing a targeted clue or small analogy without giving away the direct answer.",
    tip: "Think about edge cases like base conditions or loop bounds.",
  },
  VALIDATE_UNDERSTANDING: {
    name: "Validating Understanding",
    desc: "Checking if you can state the correction in your own words.",
    tip: "Explain why this change prevents the bug or satisfies the logic.",
  },
  COMPLETED: {
    name: "Doubt Resolved",
    desc: "You successfully discovered the fix through guided inquiry!",
    tip: "Start a new session whenever you hit your next programming doubt.",
  },
};

export function ContextPanel({
  isOpen,
  onClose,
  currentTopic,
  currentState,
  programmingLanguage,
  onLanguageChange,
}: ContextPanelProps) {
  if (!isOpen) return null;

  const currentStageInfo = STAGE_EXPLANATIONS[currentState] || STAGE_EXPLANATIONS.INTAKE;

  return (
    <aside className="w-72 bg-[#090a0e] border-l border-zinc-800/80 p-4 flex flex-col gap-5 select-none h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
          <Compass className="w-4 h-4 text-siren-400" />
          <span>Session Context</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Current Topic */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
          Active Doubt
        </span>
        <div className="p-3 rounded-xl bg-[#0e1017] border border-zinc-800 text-xs font-medium text-zinc-200 break-words">
          {currentTopic || "New Doubt Session"}
        </div>
      </div>

      {/* Programming Language Selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
          Programming Language
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onLanguageChange("python")}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              programmingLanguage === "python"
                ? "bg-siren-500/20 text-siren-300 border border-siren-500/40"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
            }`}
          >
            Python 3
          </button>
          <button
            onClick={() => onLanguageChange("cpp")}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              programmingLanguage === "cpp"
                ? "bg-siren-500/20 text-siren-300 border border-siren-500/40"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
            }`}
          >
            C++ (17)
          </button>
        </div>
      </div>

      {/* Active Pedagogical Stage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
            Active Session Stage
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            {currentState}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#10121a] to-[#0c0d12] border border-siren-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-siren-400 animate-pulse" />
            <span className="text-xs font-semibold text-siren-300 font-mono">
              {currentStageInfo.name}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {currentStageInfo.desc}
          </p>
          <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-300 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neon-pink shrink-0 mt-0.5" />
            <span>{currentStageInfo.tip}</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-500 italic px-1">
          The Navbar reflects this active state. Individual message badges show each turn's historical state.
        </p>
      </div>

      {/* Socratic Principles Summary */}
      <div className="mt-auto p-3 rounded-xl bg-[#0d0e14] border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <Info className="w-3.5 h-3.5 text-siren-400" />
          <span>The Bhasha Method</span>
        </div>
        <p className="text-zinc-500 leading-relaxed">
          Bhasha helps you uncover errors through inquiry instead of copying solutions.
        </p>
      </div>
    </aside>
  );
}

