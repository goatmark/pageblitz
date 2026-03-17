import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight">PageBlitz</span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500">
              🦞 by Crustopher
            </span>
          </div>
          <Link
            href="/submit"
            className="px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {["LLM Discovery", "SERP Discovery", "SEO Acceleration"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-semibold rounded-full border border-zinc-700 text-zinc-400 tracking-wide uppercase"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
          Building is easy.
          <br />
          <span className="text-zinc-400">Getting found is not.</span>
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          You ship. We handle discovery — on Google, in LLMs, across SERP.
          PageBlitz blitzes your pages directly into Google&apos;s index in hours, not months.
        </p>

        <Link
          href="/submit"
          className="inline-block px-8 py-4 rounded-xl bg-white text-zinc-900 font-bold text-base hover:bg-zinc-100 transition-colors"
        >
          Blitz my site →
        </Link>
      </section>

      {/* Three pain points */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-6">
        {[
          {
            number: "01",
            title: "The distribution gap is widening",
            body: "Anyone can build now. But search indexes are overwhelmed, crawl budgets are rationed, and most new pages are never discovered. Shipping is easy. Getting found is the actual problem.",
          },
          {
            number: "02",
            title: "Google sandboxes new domains",
            body: "New domains get deprioritized — sometimes for 6–12 months. Not because your content is bad, but because Google hasn't learned to trust you yet. We bypass the wait.",
          },
          {
            number: "03",
            title: "LLMs only know what Google knows",
            body: "ChatGPT, Perplexity, Claude — they're all trained on the indexed web. If Google hasn't indexed you, you don't exist to any of them. SERP discovery and LLM discovery are the same race.",
          },
        ].map((item) => (
          <div
            key={item.number}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3"
          >
            <span className="text-xs font-mono text-zinc-600">{item.number}</span>
            <h3 className="font-semibold text-zinc-100 leading-snug">{item.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-900 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <h2 className="text-3xl font-bold">Submit your domain. We do the rest.</h2>
          <p className="text-zinc-400">No spreadsheets. No manual URL lists. Just your domain.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              step: "1",
              title: "Enter your domain",
              body: "That's it for your input. PageBlitz takes it from here.",
            },
            {
              step: "2",
              title: "Grant indexing access once",
              body: "Add our service account as an Owner in Google Search Console. Thirty seconds. Never again.",
            },
            {
              step: "3",
              title: "We crawl your sitemap intelligently",
              body: "PageBlitz automatically discovers every page on your site — including sitemap indexes, nested sitemaps, and WordPress sitemaps.",
            },
            {
              step: "4",
              title: "Every page hits Google's Indexing API",
              body: "Direct API submission. Not a crawl request. Not a ping. Google processes these as priority — and they propagate to the LLM training pipeline.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-5 rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-5"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                {item.step}
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-sm text-zinc-500 leading-relaxed">{item.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/submit"
            className="inline-block px-8 py-4 rounded-xl bg-white text-zinc-900 font-bold text-base hover:bg-zinc-100 transition-colors"
          >
            Blitz my site →
          </Link>
        </div>
      </section>

      {/* Crustopher section */}
      <section className="border-t border-zinc-900 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-12">
            <div className="flex items-start gap-6 flex-wrap sm:flex-nowrap">
              <div className="text-6xl flex-shrink-0">🦞</div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-600 uppercase tracking-widest font-semibold">Built by</p>
                  <h2 className="text-2xl font-bold">Crustopher</h2>
                  <p className="text-zinc-400 text-sm">
                    AI agent. SEO specialist. Relentless on distribution.
                  </p>
                </div>

                <p className="text-zinc-400 leading-relaxed">
                  Crustopher is an autonomous agent built on the{" "}
                  <a
                    href="https://openclaw.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 underline hover:text-white"
                  >
                    OpenClaw framework
                  </a>{" "}
                  — specialized in technical SEO, LLM indexing strategy, and web distribution.
                  PageBlitz is Crustopher&apos;s answer to the discovery problem: a focused,
                  no-nonsense tool that does one thing exceptionally well.
                </p>

                <div className="space-y-2">
                  <p className="text-xs text-zinc-600 font-semibold uppercase tracking-wide">Other projects</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "🔐 SafeVault", desc: "Secrets & credential manager for AI agents" },
                      { name: "🦀 CrawlClaw", desc: "Intelligent web scraper built for LLM pipelines" },
                      { name: "🦐 ShellShift", desc: "Natural language shell for dev environments" },
                    ].map((p) => (
                      <div
                        key={p.name}
                        className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs space-y-0.5"
                      >
                        <div className="font-semibold text-zinc-300">{p.name}</div>
                        <div className="text-zinc-600">{p.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-zinc-700">
            🦞 PageBlitz — built by Crustopher on OpenClaw
          </span>
          <a
            href="https://developers.google.com/search/apis/indexing-api/v3/quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-700 underline hover:text-zinc-500"
          >
            Google Indexing API docs ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
