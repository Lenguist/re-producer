"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function normalizeArxivId(input: string): string | null {
  input = input.trim();
  const urlMatch = input.match(/arxiv\.org\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}(?:v\d+)?)/i);
  if (urlMatch) return urlMatch[1].replace(/v\d+$/, "");
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
      setError("expected: arxiv id or url (e.g. 2301.12345)");
      return;
    }
    router.push(`/paper/${id}`);
  }

  return (
    <div className="flex flex-col items-center gap-12 pt-20">

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="font-mono text-xs mb-6" style={{ color: "var(--fg-muted)" }}>
          <span style={{ color: "var(--accent)" }}>$</span> repro --check &lt;arxiv_id&gt;
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          How reproducible is this paper?
        </h1>
        <p className="text-base max-w-md mx-auto" style={{ color: "var(--fg-muted)" }}>
          Paste an arXiv ID or link. Get a grade — code, data, docs, compute — in seconds.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-2">
        <div className="flex items-center gap-0 rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--bg-border)", background: "var(--bg-surface)" }}>
          <span className="font-mono text-sm px-3" style={{ color: "var(--accent)" }}>$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            placeholder="2301.12345 or arxiv.org/abs/2301.12345"
            className="flex-1 bg-transparent py-3 pr-3 text-sm font-mono outline-none placeholder:opacity-30"
            style={{ color: "var(--fg)" }}
            autoFocus
          />
          <button type="submit" className="btn-primary rounded-none rounded-r-lg mr-0 font-mono text-sm px-5 py-3">
            run
          </button>
        </div>
        {error && (
          <p className="font-mono text-xs" style={{ color: "var(--grade-f-text)" }}>
            <span style={{ color: "var(--fg-muted)" }}>error:</span> {error}
          </p>
        )}
      </form>

      {/* Examples */}
      <div className="w-full max-w-xl space-y-3">
        <p className="font-mono text-xs" style={{ color: "var(--fg-dim)" }}>// example papers</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => router.push(`/paper/${ex.id}`)}
              className="font-mono text-xs px-3 py-1.5 rounded transition"
              style={{
                border: "1px solid var(--bg-border)",
                color: "var(--fg-muted)",
                background: "var(--bg-surface)",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--bg-border)")}
            >
              {ex.id}
              <span className="ml-2 opacity-50">{ex.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXAMPLES = [
  { id: "2303.08774", label: "GPT-4" },
  { id: "2005.14165", label: "GPT-3" },
  { id: "1706.03762", label: "Attention Is All You Need" },
  { id: "2302.13971", label: "LLaMA" },
  { id: "2310.06825", label: "Mistral 7B" },
];
