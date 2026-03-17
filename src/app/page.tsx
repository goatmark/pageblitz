import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            Google Indexing API
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-100">
            PageBlitz
          </h1>
          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            Submit pages directly to Google for faster indexing. No waiting.
            No crawl budget wasted.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            ["200", "URLs/day per service account"],
            ["~48h", "Typical indexing time"],
            ["100%", "Google official API"],
          ].map(([stat, label]) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="text-2xl font-bold text-zinc-100">{stat}</div>
              <div className="text-zinc-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-white text-zinc-900 font-semibold hover:bg-zinc-100 transition-colors"
          >
            Get started
          </Link>
          <a
            href="https://developers.google.com/search/apis/indexing-api/v3/quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            API docs
          </a>
        </div>
      </div>
    </main>
  );
}
