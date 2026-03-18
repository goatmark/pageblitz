export interface SitemapResult {
  urls: string[];
  error?: string;
  sitemapsFound: string[];
}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_URLS = 500;

async function fetchXml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "PageBlitz-Bot/1.0 (indexing accelerator)" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractTags(xml: string, tag: string): string[] {
  const results: string[] = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let match;
  while ((match = re.exec(xml)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

function parseSitemapXml(xml: string): { urls: string[]; childSitemaps: string[] } {
  const urls: string[] = [];
  const childSitemaps: string[] = [];

  const isSitemapIndex = /<sitemapindex/i.test(xml);

  if (isSitemapIndex) {
    // Extract <loc> inside each <sitemap> block
    const sitemapBlocks = extractTags(xml, "sitemap");
    for (const block of sitemapBlocks) {
      const locs = extractTags(block, "loc");
      if (locs[0]) childSitemaps.push(locs[0]);
    }
  } else {
    // Regular urlset — extract <loc> inside each <url> block
    const urlBlocks = extractTags(xml, "url");
    for (const block of urlBlocks) {
      const locs = extractTags(block, "loc");
      if (locs[0]) urls.push(locs[0]);
    }
    // Fallback: bare <loc> tags
    if (urls.length === 0) {
      for (const loc of extractTags(xml, "loc")) {
        urls.push(loc);
      }
    }
  }

  return { urls, childSitemaps };
}

/**
 * Crawl a domain's sitemap(s) and return all discovered URLs.
 * Tries common sitemap locations if /sitemap.xml returns nothing.
 */
export async function crawlSitemap(domain: string): Promise<SitemapResult> {
  const base = domain.replace(/\/$/, "");
  const candidates = [
    `${base}/sitemap.xml`,
    `${base}/sitemap_index.xml`,
    `${base}/sitemap-index.xml`,
    `${base}/sitemap/sitemap.xml`,
    `${base}/wp-sitemap.xml`, // WordPress
    `${base}/news-sitemap.xml`,
  ];

  const allUrls = new Set<string>();
  const sitemapsFound: string[] = [];

  // Try robots.txt first to find declared sitemap
  const robotsTxt = await fetchXml(`${base}/robots.txt`);
  if (robotsTxt) {
    const sitemapLines = robotsTxt
      .split("\n")
      .filter((l) => l.toLowerCase().startsWith("sitemap:"))
      .map((l) => l.replace(/^sitemap:\s*/i, "").trim());
    candidates.unshift(...sitemapLines);
  }

  // Deduplicate candidates
  const seen = new Set<string>();
  const toProcess: string[] = [];
  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);
      toProcess.push(c);
    }
  }

  for (const url of toProcess) {
    if (allUrls.size >= MAX_URLS) break;

    const xml = await fetchXml(url);
    if (!xml || !xml.includes("<")) continue;

    sitemapsFound.push(url);

    try {
      const { urls, childSitemaps } = parseSitemapXml(xml);

      for (const u of urls) {
        if (allUrls.size < MAX_URLS) allUrls.add(u);
      }

      // Queue child sitemaps
      for (const child of childSitemaps) {
        if (!seen.has(child)) {
          seen.add(child);
          toProcess.push(child);
        }
      }
    } catch {
      // Malformed XML — skip
    }

    // If we found URLs on the first hit, don't try every candidate
    if (allUrls.size > 0 && sitemapsFound.length === 1) break;
  }

  if (allUrls.size === 0) {
    return {
      urls: [],
      sitemapsFound,
      error:
        "No sitemap found. Make sure your site has a sitemap.xml and try again.",
    };
  }

  return { urls: Array.from(allUrls), sitemapsFound };
}
