import Link from "next/link";
import { ArrowRight, Brain, Code2, Compass, Globe, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060709] text-pearl flex flex-col selection:bg-siren-500/30">
      {/* Navigation */}
      <header className="h-16 border-b border-zinc-800/80 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-siren-500 to-neon-pink flex items-center justify-center text-white shadow-siren">
            <Brain className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">Bhasha</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-siren-500/10 text-siren-400 border border-siren-500/20">
            Socratic Tutor
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <Link
            href="/login"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-siren-500 to-siren-600 hover:from-siren-400 hover:to-siren-500 text-white shadow-siren transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-neon-pink" />
          <span>Powered by Sarvam AI & Sovereign Multilingual Reasoning</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] mb-6">
          Understand your thinking{" "}
          <span className="bg-gradient-to-r from-siren-400 via-sky-300 to-neon-pink bg-clip-text text-transparent">
            before correcting your code.
          </span>
        </h1>

        <p className="text-base md:text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Traditional AI chatbots spoil learning by giving direct answers.
          <strong className="text-zinc-200 font-semibold"> Bhasha</strong> is an adaptive Socratic programming tutor that asks guiding questions, traces your logic, and helps you discover your own bugs.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-siren-500 to-siren-600 hover:from-siren-400 hover:to-siren-500 text-white font-semibold text-sm shadow-siren transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Solving Doubts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#0e1017] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-sm transition-colors"
          >
            Resume Learning Session
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-[#0a0c10] border border-zinc-800/80 hover:border-siren-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-siren-500/10 border border-siren-500/20 flex items-center justify-center text-siren-400 mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-100 text-sm mb-2">
              Socratic Pedagogy
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No copied solutions. Bhasha guides you through targeted questions, hints, and step-by-step logic tracing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0a0c10] border border-zinc-800/80 hover:border-siren-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center text-neon-pink mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-100 text-sm mb-2">
              Multilingual Tutoring
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Learn comfortably in English, Hindi, Marathi, or Hinglish, while retaining exact programming syntax.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0a0c10] border border-zinc-800/80 hover:border-siren-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-zinc-100 text-sm mb-2">
              Integrated Monaco Editor
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Write, paste, and attach Python or C++ code directly with your questions for focused algorithmic guidance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-6 px-6 text-center text-xs text-zinc-500">
        Bhasha Doubt Solver • Built with Sarvam AI • Socratic Tutoring Foundation
      </footer>
    </div>
  );
}

