"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Brain, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await login({ email, password });
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please try again.");
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
        <h2 className="text-xl font-bold text-zinc-100 mb-1">Welcome back</h2>
        <p className="text-xs text-zinc-400 mb-6">
          Sign in to resume your Socratic doubt solving sessions
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1117] border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-siren-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-siren-500 to-siren-600 hover:from-siren-400 hover:to-siren-500 text-white font-semibold text-xs shadow-siren transition-all disabled:opacity-60 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          New to Bhasha?{" "}
          <Link href="/register" className="text-siren-400 hover:underline font-medium">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

