"use client";

import { useState } from "react";
import { Plus, Trash2, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import SubmissionLog from "./SubmissionLog";

interface Site {
  id: string;
  domain: string;
  service_account_email: string;
  created_at: string;
}

interface Props {
  initialSites: Site[];
}

export default function SitesPanel({ initialSites }: Props) {
  const [sites, setSites] = useState<Site[]>(initialSites);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedSite, setExpandedSite] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Remove this site?")) return;
    await fetch(`/api/sites?id=${id}`, { method: "DELETE" });
    setSites((s) => s.filter((x) => x.id !== id));
  }

  function handleAdded(site: Site) {
    setSites((s) => [site, ...s]);
    setShowAddForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sites</h2>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
        >
          <Plus size={16} />
          Add site
        </button>
      </div>

      {showAddForm && <AddSiteForm onAdded={handleAdded} />}

      {sites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500 text-sm">
          No sites yet. Add your first site to start indexing.
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => (
            <div
              key={site.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="font-medium text-sm">{site.domain}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {site.service_account_email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setExpandedSite((v) => (v === site.id ? null : site.id))
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <Send size={12} />
                    Submit URLs
                    {expandedSite === site.id ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {expandedSite === site.id && (
                <div className="border-t border-zinc-800 px-5 py-5 space-y-6">
                  <SubmitUrlsForm siteId={site.id} />
                  <SubmissionLog siteId={site.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddSiteForm({ onAdded }: { onAdded: (s: Site) => void }) {
  const [domain, setDomain] = useState("");
  const [keyJson, setKeyJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, service_account_key_json: keyJson }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
      return;
    }

    onAdded(data);
    setDomain("");
    setKeyJson("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4"
    >
      <h3 className="font-medium text-sm">Add a site</h3>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">Site URL</label>
        <input
          type="url"
          placeholder="https://example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-400">
          Service Account JSON{" "}
          <span className="text-zinc-600">(paste the full JSON key file)</span>
        </label>
        <textarea
          placeholder='{"type":"service_account","client_email":"...","private_key":"...",...}'
          value={keyJson}
          onChange={(e) => setKeyJson(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Add site
        </button>
      </div>
    </form>
  );
}

function SubmitUrlsForm({ siteId }: { siteId: string }) {
  const [urls, setUrls] = useState("");
  const [type, setType] = useState<"URL_UPDATED" | "URL_DELETED">("URL_UPDATED");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const urlList = urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const res = await fetch("/api/indexing/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, urls: urlList, type }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
    } else {
      setResult(data.message);
      setUrls("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-sm font-medium">Submit URLs</h3>

      {result && (
        <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          {result}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      <textarea
        placeholder={"https://example.com/page-1\nhttps://example.com/page-2"}
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        required
        rows={5}
        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
      />

      <div className="flex items-center gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:outline-none focus:border-zinc-500"
        >
          <option value="URL_UPDATED">URL_UPDATED</option>
          <option value="URL_DELETED">URL_DELETED</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          Submit
        </button>
      </div>
    </form>
  );
}
