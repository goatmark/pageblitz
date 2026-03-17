import SubmitForm from "@/components/SubmitForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">PageBlitz</span>
          <a
            href="#submit"
            className="px-4 py-2 rounded-lg bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 transition-colors"
          >
            Submit a URL
          </a>
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

        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          PageBlitz submits your pages directly to Google&apos;s Indexing API —
          bypassing the crawl queue and getting you in front of search engines
          and LLMs in hours, not months.
        </p>
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
          <p className="text-zinc-400">
            One-time Google setup. Then paste URLs and submit.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              step: "1",
              title: "Create a Google service account",
              body: "In Google Cloud Console, enable the Indexing API and create a service account. Download the JSON key. Takes about 5 minutes.",
            },
            {
              step: "2",
              title: "Add it as Owner in Search Console",
              body: "In Google Search Console, add your service account email as an Owner of your property. This authorizes PageBlitz to submit on your behalf.",
            },
            {
              step: "3",
              title: "Submit your URLs",
              body: "Paste your service account JSON and your URLs below. PageBlitz calls the Indexing API directly. Google prioritizes these over passive crawl queue requests.",
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
      </section>

      {/* Submit form — no auth required */}
      <section id="submit" className="border-t border-zinc-900 py-20 px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Submit your pages</h2>
            <p className="text-zinc-400 text-sm">
              No account required. Your service account key never leaves your browser.
            </p>
          </div>
          <SubmitForm />
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
