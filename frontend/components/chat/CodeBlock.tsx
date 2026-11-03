"use client";

import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  defaultExpanded?: boolean;
}

const PY_KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue", "def",
  "del", "elif", "else", "except", "finally", "for", "from", "global", "if",
  "import", "in", "is", "lambda", "nonlocal", "not", "or", "pass", "raise",
  "return", "try", "while", "with", "yield"
]);

const PY_BUILTINS = new Set([
  "True", "False", "None", "self", "int", "str", "float", "list", "dict",
  "set", "tuple", "bool", "print", "len", "range", "enumerate", "zip", "super"
]);

const CPP_KEYWORDS = new Set([
  "auto", "break", "case", "catch", "class", "const", "continue", "default",
  "delete", "do", "else", "enum", "explicit", "export", "extern", "for",
  "friend", "goto", "if", "inline", "mutable", "namespace", "new", "noexcept",
  "operator", "private", "protected", "public", "return", "sizeof", "static",
  "struct", "switch", "template", "this", "throw", "try", "typedef", "typeid",
  "typename", "union", "using", "virtual", "while"
]);

const CPP_TYPES = new Set([
  "int", "char", "bool", "float", "double", "void", "long", "short",
  "unsigned", "signed", "size_t", "nullptr", "true", "false", "std",
  "cout", "cin", "endl", "vector", "string", "map", "set", "pair"
]);

function highlightLine(line: string, lang: string): React.ReactNode {
  const isCpp = lang.toLowerCase().includes("c++") || lang.toLowerCase() === "cpp";

  // Check for entire line comment or preprocessor
  const trimmed = line.trimStart();
  if (trimmed.startsWith("#") && !isCpp) {
    return <span className="text-zinc-500 italic">{line}</span>;
  }
  if (trimmed.startsWith("//") && isCpp) {
    return <span className="text-zinc-500 italic">{line}</span>;
  }
  if (trimmed.startsWith("#include") && isCpp) {
    return <span className="text-pink-400 font-semibold">{line}</span>;
  }

  // Tokenize line using regex
  // Matches: strings | comments | words | numbers | operators | other
  const tokenRegex = isCpp
    ? /(\/\/[^\n]*|\/\*.*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[a-zA-Z_]\w*\b|\b\d+(?:\.\d+)?\b|[^\s\w]+|\s+)/g
    : /(#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b[a-zA-Z_]\w*\b|\b\d+(?:\.\d+)?\b|[^\s\w]+|\s+)/g;

  const tokens = line.match(tokenRegex) || [line];

  return tokens.map((token, idx) => {
    // Comments
    if (token.startsWith("//") || token.startsWith("/*") || (!isCpp && token.startsWith("#"))) {
      return (
        <span key={idx} className="text-zinc-500 italic">
          {token}
        </span>
      );
    }
    // Strings
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'")) ||
      token.startsWith('"""') ||
      token.startsWith("'''")
    ) {
      return (
        <span key={idx} className="text-emerald-300">
          {token}
        </span>
      );
    }
    // Numbers
    if (/^\d+(\.\d+)?$/.test(token)) {
      return (
        <span key={idx} className="text-amber-300">
          {token}
        </span>
      );
    }
    // Keywords / Types / Builtins
    if (isCpp) {
      if (CPP_KEYWORDS.has(token)) {
        return (
          <span key={idx} className="text-purple-400 font-semibold">
            {token}
          </span>
        );
      }
      if (CPP_TYPES.has(token)) {
        return (
          <span key={idx} className="text-cyan-300">
            {token}
          </span>
        );
      }
    } else {
      if (PY_KEYWORDS.has(token)) {
        return (
          <span key={idx} className="text-purple-400 font-semibold">
            {token}
          </span>
        );
      }
      if (PY_BUILTINS.has(token)) {
        return (
          <span key={idx} className="text-cyan-300">
            {token}
          </span>
        );
      }
    }

    // Default plain text / operators / whitespace
    return <span key={idx} className="text-zinc-200">{token}</span>;
  });
}

export function CodeBlock({
  code,
  language = "python",
  title,
  defaultExpanded = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const lines = code.trimEnd().split("\n");
  const isLong = lines.length > 10;
  const displayedLines = isLong && !isExpanded ? lines.slice(0, 10) : lines;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language.toUpperCase() === "CPP" ? "C++" : language.toUpperCase();

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#08090d] my-2 shadow-md w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0e1017] border-b border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-2 font-mono">
          <Terminal className="w-3.5 h-3.5 text-siren-400 shrink-0" />
          <span className="font-semibold text-zinc-300 text-[11px] tracking-wide">
            {title || `${displayLang} Snippet`}
          </span>
          <span className="text-[10px] text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded">
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLong && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-0.5 rounded hover:bg-zinc-800"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Expand ({lines.length} lines)</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-0.5 rounded hover:bg-zinc-800"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code container with line numbers and syntax highlighting */}
      <div className="relative">
        <pre className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre selection:bg-siren-500/30">
          <code>
            {displayedLines.map((line, idx) => (
              <div key={idx} className="table-row">
                <span className="table-cell select-none text-right pr-4 text-zinc-600 text-[11px] font-mono w-6">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre">
                  {highlightLine(line, language)}
                </span>
              </div>
            ))}
          </code>
        </pre>

        {/* Fade overlay when collapsed */}
        {isLong && !isExpanded && (
          <div
            onClick={() => setIsExpanded(true)}
            className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#08090d] to-transparent flex items-end justify-center pb-1.5 cursor-pointer hover:bg-zinc-900/10 transition-colors"
          >
            <span className="text-[10px] font-mono text-siren-400 flex items-center gap-1 bg-[#0e1017] border border-zinc-800 px-2.5 py-0.5 rounded-full shadow-sm hover:border-siren-500/40">
              <ChevronDown className="w-3 h-3" /> Show remaining {lines.length - 10} lines
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

