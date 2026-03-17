"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";

type ResultRow = {
  url: string;
  success: boolean;
  error?: string;
  statusCode?: number;
};

export default function SubmitForm() {
  const [keyJson, setKeyJson] = useState("");
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setError(null);

    const urlList = urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    if (urlList.length === 0) {
      setError("Enter at least one URL.");
      setLoading(false);
      return;
    }

    let parsedKey: unknown;
    try {
      parsedKey = JSON.parse(keyJson);
    } catch {
      setError("Service account JSON is not valid JSON.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/indexing/instant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_account_key: parsedKey, urls: urlList }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setResults(data.results);
  }

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results ? results.length - successCount : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Service account key */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">
            Service account JSON key
          </label>
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {showKey ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        <textarea
          value={keyJson}
          onChange={(e) => setKeyJson(e.target.value)}
          required
          rows={showKey ? 8 : 3}
          placeholder='{"type":"service_account","client_email":"...","private_key":"..."}'
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 resize-none transition-all"
        />
        <p className="text-xs text-zinc-700">
          Your key is sent only to our server to make the API call and is never stored.
        </p>
      </div>

      {/* URLs */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">
          URLs to submit{" "}
          <span className="text-zinc-600 font-normal">(one per line)</span>
        </label>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          required
          rows={5}
          placeholder={"https://yoursite.com/blog/post-1\nhttps://yoursite.com/about\nhttps://yoursite.com/pricing"}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <XCircle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Submitting to Google…" : "Submit to Google Indexing API"}
      </button>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400 font-medium">
              {successCount} submitted
            </span>
            {failCount > 0 && (
              <span className="text-red-400 font-medium">{failCount} failed</span>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {results.map((r) => (
              <div
                key={r.url}
                className="flex items-start gap-3 px-4 py-3 border-b border-zinc-800 last:border-0"
              >
                {r.success ? (
                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-mono text-zinc-300 truncate">{r.url}</div>
                  {r.error && (
                    <div className="text-xs text-red-400 mt-0.5">{r.error}</div>
                  )}
                </div>
                {r.statusCode && (
                  <span className="ml-auto text-xs text-zinc-600 flex-shrink-0">
                    {r.statusCode}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
