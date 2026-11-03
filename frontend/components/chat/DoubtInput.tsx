"use client";

import React, { KeyboardEvent, useState } from "react";
import { ArrowUp, Code2, Sparkles } from "lucide-react";

interface DoubtInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onToggleEditor: () => void;
  isEditorOpen: boolean;
  hasCodeAttached: boolean;
}

export function DoubtInput({
  onSend,
  isLoading,
  onToggleEditor,
  isEditorOpen,
  hasCodeAttached,
}: DoubtInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-[#07080c] border-t border-zinc-800/80">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {/* Top Controls Strip */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleEditor}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                isEditorOpen
                  ? "bg-siren-500/20 text-siren-300 border border-siren-500/40"
                  : hasCodeAttached
                  ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/40"
                  : "bg-zinc-800/60 text-zinc-400 border border-zinc-700/60 hover:text-zinc-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isEditorOpen ? "Hide Code Editor" : hasCodeAttached ? "Code Attached" : "Attach Code"}</span>
            </button>
          </div>

          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Shift+Enter</kbd> for newline
          </span>
        </div>

        {/* Input Textarea and Send Button */}
        <div className="flex items-end gap-2 p-2 rounded-2xl bg-[#0e1017] border border-zinc-800 focus-within:border-siren-500/60 transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Explain your approach, ask a doubt, or answer Bhasha's guiding question..."
            rows={2}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none px-2 py-1 leading-relaxed max-h-36 overflow-y-auto"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              text.trim() && !isLoading
                ? "bg-gradient-to-tr from-siren-500 to-siren-600 text-white shadow-siren hover:brightness-110 active:scale-95"
                : "bg-zinc-800/80 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Sparkles className="w-4 h-4 animate-spin text-siren-400" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

