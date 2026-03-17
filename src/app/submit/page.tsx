import Link from "next/link";
import SubmitForm from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight hover:text-zinc-300 transition-colors">
            PageBlitz
          </Link>
          <a
            href="https://developers.google.com/search/apis/indexing-api/v3/quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Setup guide ↗
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Submit your pages</h1>
          <p className="text-zinc-400">
            Paste your Google service account key and the URLs you want indexed.
            Your key is used for this request only — never stored.
          </p>
        </div>

        {/* Setup reminder */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 text-sm space-y-2">
          <p className="font-medium text-zinc-300">Before you start, you need:</p>
          <ol className="list-decimal list-inside space-y-1 text-zinc-500">
            <li>
              A{" "}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 underline hover:text-zinc-200"
              >
                GCP service account
              </a>{" "}
              with the Indexing API enabled and a downloaded JSON key
            </li>
            <li>
              That service account added as an <strong className="text-zinc-300">Owner</strong> in{" "}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 underline hover:text-zinc-200"
              >
                Google Search Console
              </a>{" "}
              for your property
            </li>
          </ol>
        </div>

        {/* The form */}
        <SubmitForm />
      </div>
    </main>
  );
}
