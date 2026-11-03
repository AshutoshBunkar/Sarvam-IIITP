"use client";

import React from "react";
import { Sparkles, User as UserIcon } from "lucide-react";
import { Message } from "@/types";
import { formatTime } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";

interface ChatMessageItemProps {
  message: Message;
  programmingLanguage?: string;
}

interface ContentPart {
  type: "text" | "code";
  content: string;
  language?: string;
}

/**
 * Parses message content to separate ordinary text from embedded markdown code blocks.
 * Prevents multiline code from ever being rendered as ordinary paragraph text.
 */
function parseMessageContent(text: string, defaultLanguage: string): ContentPart[] {
  if (!text) return [];

  const parts: ContentPart[] = [];
  const fenceRegex = /```([a-zA-Z0-9_\-+]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(text)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      const textPart = text.slice(lastIndex, match.index).trim();
      if (textPart) {
        parts.push({ type: "text", content: textPart });
      }
    }

    // Code block
    const fenceLang = match[1]?.trim() || defaultLanguage;
    const codeContent = match[2]?.replace(/\r\n/g, "\n");
    if (codeContent) {
      parts.push({
        type: "code",
        content: codeContent,
        language: fenceLang,
      });
    }

    lastIndex = fenceRegex.lastIndex;
  }

  // Remaining trailing text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).trim();
    if (remainingText) {
      // Heuristic: If there were no fences, but the entire message is multiline source code
      const lines = remainingText.split("\n");
      const codeKeywords = /\b(def|class|return|if|else|for|while|import|#include|int|void|public|std::)\b/;
      const isPureCode =
        lines.length >= 3 &&
        codeKeywords.test(remainingText) &&
        (remainingText.includes("{") || remainingText.includes(":") || remainingText.includes(";"));

      if (parts.length === 0 && isPureCode) {
        parts.push({
          type: "code",
          content: remainingText,
          language: defaultLanguage,
        });
      } else {
        parts.push({ type: "text", content: remainingText });
      }
    }
  }

  return parts;
}

export function ChatMessageItem({
  message,
  programmingLanguage = "python",
}: ChatMessageItemProps) {
  const isAssistant = message.role === "assistant";
  const contentParts = parseMessageContent(message.content, programmingLanguage);

  return (
    <div
      className={`flex w-full mb-6 ${
        isAssistant ? "justify-start" : "justify-end"
      }`}
    >
      <div
        className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${
          isAssistant ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
            isAssistant
              ? "bg-gradient-to-tr from-siren-600 to-neon-pink text-white shadow-siren"
              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
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

            {/* Turn State Badge (distinct from Navbar's active session state) */}
            {isAssistant && message.agent_state && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1"
                title={`Historical turn state when this answer was generated: ${message.agent_state}`}
              >
                <span className="text-zinc-500 text-[9px] uppercase font-semibold">Turn State:</span>
                <span className="text-siren-400 font-semibold">{message.agent_state}</span>
              </span>
            )}

            <span className="text-[11px] text-zinc-500">
              {formatTime(message.created_at)}
            </span>
          </div>

          {/* Dedicated Code Snippet Attached via Drawer (if any) */}
          {message.code_snippet && message.code_snippet.trim() && (
            <div className="w-full">
              <CodeBlock
                code={message.code_snippet}
                language={programmingLanguage}
                title={isAssistant ? "Tutor Suggested Snippet" : "Student Attached Code"}
                defaultExpanded={false}
              />
            </div>
          )}

          {/* Parsed Message Content (Keeps text and code visually separate) */}
          {contentParts.map((part, index) => {
            if (part.type === "code") {
              return (
                <div key={index} className="w-full">
                  <CodeBlock
                    code={part.content}
                    language={part.language || programmingLanguage}
                    title={isAssistant ? "Code Reference" : "Submitted Code"}
                    defaultExpanded={false}
                  />
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  isAssistant
                    ? "bg-[#0f1117] text-zinc-100 border border-zinc-800/80 rounded-tl-sm shadow-sm"
                    : "bg-siren-600/15 text-zinc-100 border border-siren-500/30 rounded-tr-sm"
                }`}
              >
                {part.content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
