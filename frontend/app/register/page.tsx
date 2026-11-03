"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Brain, Loader2 } from "lucide-react";
import { NaturalLanguage, ProgrammingLanguage } from "@/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<NaturalLanguage>("English");
  const [programmingLanguage, setProgrammingLanguage] = useState<ProgrammingLanguage>("python");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await register({
        full_name: fullName,
        email,
        password,
        preferred_language: preferredLanguage,
        programming_language: programmingLanguage,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060709] text-pearl flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-siren-500 to-neon-pink flex items-center justify-center text-white shadow-siren">
          <Brain className="w-5 h-5" />
        </div>
        <span className="font-bold text-2xl tracking-tight text-white">Bhasha</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#0a0c10] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-zinc-100 mb-1">Create Student Profile</h2>
        <p className="text-xs text-zinc-400 mb-6">
          Start your personalized Socratic programming journey
        </p>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1117] border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-siren-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1117] border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-siren-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1117] border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-siren-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as NaturalLanguage)}
                className="w-full px-3 py-2 rounded-xl bg-[#0f1117] border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-siren-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Coding Language
              </label>
              <select
                value={programmingLanguage}
                onChange={(e) => setProgrammingLanguage(e.target.value as ProgrammingLanguage)}
                className="w-full px-3 py-2 rounded-xl bg-[#0f1117] border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-siren-500"
              >
                <option value="python">Python 3</option>
                <option value="cpp">C++ (17)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-siren-500 to-siren-600 hover:from-siren-400 hover:to-siren-500 text-white font-semibold text-xs shadow-siren transition-all disabled:opacity-60 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          Already registered?{" "}
          <Link href="/login" className="text-siren-400 hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

