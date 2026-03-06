"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function normalizeArxivId(input: string): string | null {
  input = input.trim();
  // Full URL: arxiv.org/abs/2301.12345 or arxiv.org/pdf/2301.12345
  const urlMatch = input.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/i);
  if (urlMatch) return urlMatch[1].replace(/v\d+$/, "");
  // Bare ID: 2301.12345 or 2301.12345v2
  const bareMatch = input.match(/^([0-9]{4}\.[0-9]{4,5})(?:v\d+)?$/);
  if (bareMatch) return bareMatch[1];
  return null;
}

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = normalizeArxivId(input);
    if (!id) {
      setError("Enter an arXiv ID (e.g. 2301.12345) or URL");
      return;
    }
    router.push(`/paper/${id}`);
  }

  return (
    <div className="flex flex-col items-center gap-10 pt-16">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          How reproducible is this paper?
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-lg">
          Paste an arXiv link or ID. We score it on code availability, data
          openness, documentation, and compute requirements — instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            placeholder="arxiv.org/abs/2301.12345 or 2301.12345"
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            autoFocus
          />
          <button type="submit" className="btn-primary">
            Score it
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>

      <div className="w-full max-w-xl border-t border-gray-100 dark:border-gray-800 pt-8 space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => router.push(`/paper/${ex.id}`)}
              className="text-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:text-violet-600 transition"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXAMPLES = [
  { id: "2303.08774", label: "GPT-4 Technical Report" },
  { id: "2005.14165", label: "GPT-3" },
  { id: "1706.03762", label: "Attention Is All You Need" },
  { id: "2302.13971", label: "LLaMA" },
  { id: "2310.06825", label: "Mistral 7B" },
];
