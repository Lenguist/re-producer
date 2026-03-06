import Link from "next/link";

export default function NavBar() {
  return (
    <nav style={{ borderBottom: "1px solid var(--bg-border)", background: "var(--bg)" }}>
      <div className="mx-auto max-w-3xl px-4 h-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span style={{ color: "var(--fg-muted)" }} className="font-mono text-sm">~/</span>
          <span className="font-mono font-bold text-base tracking-tight" style={{ color: "var(--fg)" }}>
            re:producer
          </span>
        </Link>
        <span className="font-mono text-xs" style={{ color: "var(--fg-dim)" }}>
          reproducibility scores for cs papers
        </span>
      </div>
    </nav>
  );
}
