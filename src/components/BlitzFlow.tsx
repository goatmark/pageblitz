"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ArrowRight, ExternalLink } from "lucide-react";

const SA_EMAIL = process.env.NEXT_PUBLIC_PAGEBLITZ_SA_EMAIL ?? "indexer@pageblitz-prod.iam.gserviceaccount.com";

type Step = "domain" | "verify" | "crawling" | "review" | "submitting" | "done";

interface UrlResult {
  url: string;
  success: boolean;
  error?: string;
  statusCode?: number;
}

export default function BlitzFlow() {
  const [step, setStep] = useState<Step>("domain");
  const [domain, setDomain] = useState("");
  const [verified, setVerified] = useState(false);
  const [crawledUrls, setCrawledUrls] = useState<string[]>([]);
  const [sitemaps, setSitemaps] = useState<string[]>([]);
  const [results, setResults] = useState<UrlResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCrawl() {
    setLoading(true);
    setError(null);
    setStep("crawling");

    const res = await fetch("/api/crawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not crawl sitemap.");
      setStep("verify");
      return;
    }

    setCrawledUrls(data.urls);
    setSitemaps(data.sitemaps);
    setStep("review");
  }

  async function handleSubmit() {
    setLoading(true);
    setStep("submitting");
    setError(null);

    const res = await fetch("/api/indexing/domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: crawledUrls }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Submission failed.");
      setStep("review");
      return;
    }

    setResults(data.results);
    setStep("done");
  }

  function reset() {
    setStep("domain");
    setDomain("");
    setVerified(false);
    setCrawledUrls([]);
    setSitemaps([]);
    setResults([]);
    setError(null);
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        {(["domain", "verify", "review", "done"] as const).map((s, i) => {
          const labels = ["Enter domain", "Verify access", "Review URLs", "Done"];
          const stepOrder = ["domain", "verify", "crawling", "review", "submitting", "done"];
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = stepOrder.indexOf(s);
          const done = currentIdx > thisIdx;
          const active = currentIdx === thisIdx;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${active ? "text-zinc-200" : done ? "text-green-500" : "text-zinc-700"}`}>
                {done ? <CheckCircle2 size={12} /> : <span className="w-3 h-3 rounded-full border border-current inline-block" />}
                {labels[i]}
              </div>
              {i < 3 && <ArrowRight size={10} className="text-zinc-800" />}
            </div>
          );
        })}
      </div>

      {/* Step: Enter domain */}
      {step === "domain" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Your website domain</label>
            <input
              type="url"
              placeholder="https://yoursite.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && domain && setStep("verify")}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <button
            onClick={() => setStep("verify")}
            disabled={!domain}
            className="w-full py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 disabled:opacity-40 transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step: Verify */}
      {step === "verify" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-200">One-time setup: grant indexing access</p>
              <p className="text-sm text-zinc-500">
                Add the PageBlitz service account as an <strong className="text-zinc-300">Owner</strong> in Google Search Console for <span className="text-zinc-300 font-mono">{domain}</span>.
              </p>
            </div>

            <div className="rounded-lg bg-zinc-800 px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-300 break-all">{SA_EMAIL}</span>
              <button
                onClick={() => navigator.clipboard.writeText(SA_EMAIL)}
                className="flex-shrink-0 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Copy
              </button>
            </div>

            <ol className="text-xs text-zinc-500 space-y-1.5 list-decimal list-inside">
              <li>Open <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline">Google Search Console <ExternalLink size={10} className="inline" /></a></li>
              <li>Select your property for <span className="text-zinc-300 font-mono">{domain}</span></li>
              <li>Go to Settings → Users and permissions → Add user</li>
              <li>Paste the email above, set role to <strong className="text-zinc-300">Owner</strong>, click Add</li>
            </ol>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <XCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-zinc-400">I&apos;ve added the service account as Owner</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl border border-zinc-800 text-zinc-500 text-sm hover:border-zinc-600 hover:text-zinc-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCrawl}
              disabled={!verified || loading}
              className="flex-1 py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Crawl sitemap &amp; discover pages
            </button>
          </div>
        </div>
      )}

      {/* Step: Crawling */}
      {step === "crawling" && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-zinc-500">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
          <p className="text-sm">Crawling sitemap for <span className="text-zinc-300">{domain}</span>…</p>
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-zinc-200">{crawledUrls.length} pages discovered</p>
              <p className="text-xs text-zinc-600 mt-0.5">
                from {sitemaps.length} sitemap{sitemaps.length !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-xs text-zinc-600 font-mono">{domain}</span>
          </div>

          <div className="rounded-xl border border-zinc-800 overflow-hidden max-h-60 overflow-y-auto">
            {crawledUrls.slice(0, 100).map((url) => (
              <div key={url} className="px-4 py-2 border-b border-zinc-800/60 last:border-0 text-xs font-mono text-zinc-400 truncate hover:text-zinc-200 transition-colors">
                {url}
              </div>
            ))}
            {crawledUrls.length > 100 && (
              <div className="px-4 py-2 text-xs text-zinc-600 text-center">
                +{crawledUrls.length - 100} more
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-100 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            🚀 Blitz {crawledUrls.length} pages to Google
          </button>
        </div>
      )}

      {/* Step: Submitting */}
      {step === "submitting" && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-zinc-500">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
          <p className="text-sm">Submitting {crawledUrls.length} URLs to Google Indexing API…</p>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-5 py-4 space-y-1">
            <p className="font-bold text-green-400 text-lg">🦞 Blitz complete.</p>
            <p className="text-sm text-zinc-400">
              <span className="text-green-400 font-semibold">{succeeded} pages</span> submitted to Google.
              {failed > 0 && <span className="text-red-400 ml-2">{failed} failed.</span>}
              {" "}Google typically indexes within 24–48 hours.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 overflow-hidden max-h-72 overflow-y-auto">
            {results.map((r) => (
              <div key={r.url} className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800/60 last:border-0">
                {r.success
                  ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                  : <XCircle size={14} className="text-red-500 flex-shrink-0" />}
                <span className="text-xs font-mono text-zinc-400 truncate flex-1">{r.url}</span>
                {r.error && <span className="text-xs text-red-400 flex-shrink-0">{r.error}</span>}
              </div>
            ))}
          </div>

          <button
            onClick={reset}
            className="w-full py-3 rounded-xl border border-zinc-800 text-zinc-400 text-sm hover:border-zinc-600 hover:text-zinc-200 transition-colors"
          >
            Submit another domain
          </button>
        </div>
      )}
    </div>
  );
}
