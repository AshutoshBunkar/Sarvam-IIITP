"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { Code2, Trash2, X } from "lucide-react";
import { ProgrammingLanguage } from "@/types";

interface CodeEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  onChange: (value: string) => void;
  language: ProgrammingLanguage;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
}

export function CodeEditorDrawer({
  isOpen,
  onClose,
  code,
  onChange,
  language,
  onLanguageChange,
}: CodeEditorDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="w-full md:w-1/2 border-l border-zinc-800 bg-[#090a0e] flex flex-col h-full z-20">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0e14] border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2 font-medium text-zinc-300">
          <Code2 className="w-4 h-4 text-siren-400" />
          <span>Code Workspace</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as ProgrammingLanguage)}
            className="bg-[#14161f] text-zinc-200 border border-zinc-700 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-siren-500"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>

          {/* Clear Code */}
          {code && (
            <button
              onClick={() => onChange("")}
              title="Clear code"
              className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close Panel */}
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-[300px]">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : "python"}
          value={code}
          onChange={(val) => onChange(val || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12 },
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="px-4 py-2 bg-[#0c0d12] border-t border-zinc-800/80 text-[11px] text-zinc-500 flex justify-between items-center">
        <span>Write or paste code here to send with your question</span>
        <span className="font-mono text-zinc-400">
          {code ? `${code.split("\n").length} lines` : "Empty snippet"}
        </span>
      </div>
    </div>
  );
}

