import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">PageBlitz</span>
          <Link
            href="/submit"
            className="px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
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
          PageBlitz submits your pages directly to Google&apos;s Indexing API —
          bypassing the crawl queue and getting you in front of search engines
          and LLMs in hours, not months.
        </p>

        <Link
          href="/submit"
          className="inline-block px-8 py-4 rounded-xl bg-white text-zinc-900 font-bold text-base hover:bg-zinc-100 transition-colors"
        >
          Get started — it&apos;s free
        </Link>
      </section>

      {/* Three pain points */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-6">
        {[
          {
            number: "01",
            title: "The distribution gap is widening",
            body: "The tools to build have never been better. But search indexes are overwhelmed, crawl budgets are tight, and most new pages never get discovered at all.",
          },
          {
            number: "02",
            title: "Google penalizes new domains hard",
            body: "A brand-new domain can wait 6–12 months for meaningful organic traction. Google's trust signals take time — unless you tell Google directly that your pages exist.",
          },
          {
            number: "03",
            title: "LLMs train on what's indexed",
            body: "ChatGPT, Perplexity, and every AI assistant pull from the web. If you're not indexed, you don't exist to them either. SERP discovery and LLM discovery are now the same problem.",
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
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <h2 className="text-3xl font-bold">How it works</h2>
          <p className="text-zinc-400">One-time Google setup. Then paste URLs and go.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              step: "1",
              title: "Create a Google service account",
              body: "In Google Cloud Console, enable the Indexing API, create a service account, and download the JSON key. Takes about 5 minutes.",
            },
            {
              step: "2",
              title: "Add it as Owner in Search Console",
              body: "In Google Search Console, add the service account email as an Owner of your property. This is how Google knows you've authorized the submissions.",
            },
            {
              step: "3",
              title: "Paste your key and URLs — done",
              body: "PageBlitz calls the Indexing API directly. Google prioritizes these requests over passive crawling. Your key is never stored.",
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
            Submit your pages
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-6 text-center text-xs text-zinc-700">
        PageBlitz uses the official Google Indexing API.{" "}
        <a
          href="https://developers.google.com/search/apis/indexing-api/v3/quickstart"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-500"
        >
          Google docs ↗
        </a>
      </footer>
    </main>
  );
}
