import { parseStringPromise } from "xml2js";

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

async function parseSitemapXml(xml: string, sourceUrl: string): Promise<{
  urls: string[];
  childSitemaps: string[];
}> {
  const parsed = await parseStringPromise(xml, { explicitArray: true });
  const urls: string[] = [];
  const childSitemaps: string[] = [];

  // Sitemap index (points to other sitemaps)
  if (parsed.sitemapindex?.sitemap) {
    for (const s of parsed.sitemapindex.sitemap) {
      const loc = s.loc?.[0];
      if (loc) childSitemaps.push(loc.trim());
    }
  }

  // Regular sitemap (contains URLs)
  if (parsed.urlset?.url) {
    for (const u of parsed.urlset.url) {
      const loc = u.loc?.[0];
      if (loc) urls.push(loc.trim());
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
      const { urls, childSitemaps } = await parseSitemapXml(xml, url);

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
