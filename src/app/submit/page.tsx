import Link from "next/link";
import BlitzFlow from "@/components/BlitzFlow";

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight hover:text-zinc-300 transition-colors"
          >
            PageBlitz
          </Link>
          <span className="text-xs text-zinc-600">🦞 Crustopher is on it</span>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Blitz your site</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Enter your domain. Crustopher crawls your sitemap, discovers every page,
            and fires them all directly at Google&apos;s Indexing API.
            No spreadsheets. No pasting URLs. Just results.
          </p>
        </div>

        <BlitzFlow />
      </div>
    </main>
  );
}
