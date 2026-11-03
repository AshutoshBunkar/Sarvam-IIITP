"use client";

import React, { useEffect, useRef } from "react";
import { Message } from "@/types";
import { ChatMessageItem } from "./ChatMessageItem";
import { BrainCircuit, Lightbulb, Sparkles } from "lucide-react";

interface ChatThreadProps {
  messages: Message[];
  isLoading: boolean;
  programmingLanguage?: string;
  naturalLanguage?: string;
}

export function ChatThread({
  messages,
  isLoading,
  programmingLanguage = "python",
  naturalLanguage = "English",
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-siren-500/20 to-neon-pink/20 border border-siren-500/30 flex items-center justify-center mb-6 shadow-siren">
          <BrainCircuit className="w-8 h-8 text-siren-400" />
        </div>
        <h3 className="text-xl font-bold text-zinc-100 mb-2">
          Socratic Programming Tutor
        </h3>
        <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          I will not simply hand you the solution. Tell me what problem you are trying to solve, what approach you attempted, or attach your code.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg text-left text-xs">
          <div className="p-3 rounded-xl bg-[#0c0d12] border border-zinc-800 text-zinc-300 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-neon-pink shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-200">First Principles</span>
              <p className="text-zinc-400 mt-0.5">We break down your logic step-by-step together.</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#0c0d12] border border-zinc-800 text-zinc-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-siren-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-200">Multilingual</span>
              <p className="text-zinc-400 mt-0.5">
                Responding in {naturalLanguage} with exact {programmingLanguage.toUpperCase()} syntax.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      {messages.map((msg) => (
        <ChatMessageItem
          key={msg.id}
          message={msg}
          programmingLanguage={programmingLanguage}
        />
      ))}

      {isLoading && (
        <div className="flex items-center gap-3 text-sm text-zinc-400 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-siren-600 to-neon-pink flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#0f1117] border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-siren-400 animate-ping" />
            <span className="text-xs text-zinc-300 font-mono">
              Bhasha is reflecting on your reasoning...
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

