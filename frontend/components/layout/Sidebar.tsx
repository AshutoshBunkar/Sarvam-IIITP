"use client";

import React from "react";
import { NaturalLanguage, SessionSummary, User } from "@/types";
import {
  Globe,
  LogOut,
  MessageSquare,
  Plus,
  Terminal,
  User as UserIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SidebarProps {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  naturalLanguage: NaturalLanguage;
  onLanguageChange: (lang: NaturalLanguage) => void;
  user: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

const LANGUAGES: NaturalLanguage[] = ["English", "Hindi", "Marathi", "Hinglish"];

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  naturalLanguage,
  onLanguageChange,
  user,
  onLogout,
  isOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#090a0f] border-r border-zinc-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* New Session Button */}
      <div className="p-4 border-b border-zinc-800/80">
        <button
          onClick={() => {
            onNewSession();
            onCloseMobile?.();
          }}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-siren-500 to-siren-600 hover:from-siren-400 hover:to-siren-500 text-white text-xs font-semibold shadow-siren transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Doubt Session</span>
        </button>
      </div>

      {/* Language Selector */}
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-[#07080c]">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1.5">
          <Globe className="w-3.5 h-3.5 text-siren-400" />
          <span>Tutor Language</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2 py-1 rounded-md text-xs text-center transition-all ${
                naturalLanguage === lang
                  ? "bg-siren-500/20 text-siren-300 border border-siren-500/40 font-medium"
                  : "bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions History List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 px-2 py-1 font-semibold">
          Previous Doubts ({sessions.length})
        </span>

        {sessions.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500">
            No previous sessions yet. Start your first doubt above.
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <button
                key={s.id}
                onClick={() => {
                  onSelectSession(s.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left text-xs transition-colors ${
                  isActive
                    ? "bg-[#13151f] text-white border border-siren-500/30 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200 border border-transparent"
                }`}
              >
                <MessageSquare className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isActive ? "text-siren-400" : "text-zinc-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-zinc-200">
                    {s.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
                    <span>{s.programming_language.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatDate(s.updated_at)}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-zinc-800/80 bg-[#07080c] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-200 font-semibold shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4 text-zinc-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-zinc-200 truncate">
              {user?.full_name || "Student"}
            </div>
            <div className="text-[10px] text-zinc-500 truncate">
              {user?.email || ""}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Sign out"
          className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

