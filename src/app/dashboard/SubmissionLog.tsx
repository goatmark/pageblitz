"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

type Status = "pending" | "submitted" | "error" | "rate_limited";

interface Submission {
  id: string;
  url: string;
  type: string;
  status: Status;
  error_message: string | null;
  submitted_at: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<Status, string> = {
  submitted: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  rate_limited: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function SubmissionLog({ siteId }: { siteId: string }) {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/indexing/status?site_id=${siteId}&limit=50`);
    const data = await res.json();
    setRows(data.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [siteId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Submission log</h3>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="text-xs text-zinc-600 py-4 text-center">
          No submissions yet for this site.
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="text-left px-4 py-2.5 text-zinc-400 font-medium">URL</th>
                <th className="text-left px-4 py-2.5 text-zinc-400 font-medium w-28">Status</th>
                <th className="text-left px-4 py-2.5 text-zinc-400 font-medium w-32">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="truncate max-w-xs font-mono text-zinc-300">
                      {row.url}
                    </div>
                    {row.error_message && (
                      <div className="text-red-400 mt-0.5">{row.error_message}</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium ${STATUS_STYLES[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">
                    {row.submitted_at
                      ? new Date(row.submitted_at).toLocaleString()
                      : row.status === "pending"
                      ? "Queued…"
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
