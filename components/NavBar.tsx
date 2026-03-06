import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight">
          re:producer
        </Link>
        <span className="text-xs text-gray-400">reproducibility scores for CS papers</span>
      </div>
    </nav>
  );
}
