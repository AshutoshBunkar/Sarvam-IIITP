"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, User as UserIcon, Sparkles } from "lucide-react";
import { Message } from "@/types";
import { formatTime } from "@/lib/utils";

interface ChatMessageItemProps {
  message: Message;
  programmingLanguage?: string;
}

export function ChatMessageItem({ message, programmingLanguage = "python" }: ChatMessageItemProps) {
  const isAssistant = message.role === "assistant";
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div
      className={`flex w-full mb-6 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${
          isAssistant ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
            isAssistant
              ? "bg-gradient-to-tr from-siren-600 to-neon-pink text-white shadow-siren"
              : "bg-zinc-800 text-zinc-300 border border-border"
          }`}
        >
          {isAssistant ? <Sparkles className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {/* Header Metadata */}
          <div
            className={`flex items-center gap-2 text-xs text-zinc-400 ${
              isAssistant ? "justify-start" : "justify-end"
            }`}
          >
            <span className="font-medium text-zinc-300">
              {isAssistant ? "Bhasha Tutor" : "You"}
            </span>
            {isAssistant && message.agent_state && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide bg-siren-500/10 text-siren-400 border border-siren-500/20">
                {message.agent_state}
              </span>
            )}
            <span className="text-[11px] text-zinc-500">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* Code Snippet Attached (if any) */}
          {message.code_snippet && (
            <div className="rounded-lg overflow-hidden border border-zinc-800 bg-[#090a0f] mb-1">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0e1017] border-b border-zinc-800 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-siren-400" />
                  {programmingLanguage.toUpperCase()} Code
                </span>
                <button
                  onClick={() => copyCode(message.code_snippet!)}
                  className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                >
                  {copiedSnippet ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-zinc-200 overflow-x-auto whitespace-pre leading-relaxed">
                {message.code_snippet}
              </pre>
            </div>
          )}

          {/* Text Content */}
          <div
            className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
              isAssistant
                ? "bg-[#0f1117] text-zinc-100 border border-zinc-800/80 rounded-tl-sm shadow-sm"
                : "bg-siren-600/15 text-zinc-100 border border-siren-500/30 rounded-tr-sm"
            }`}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}

