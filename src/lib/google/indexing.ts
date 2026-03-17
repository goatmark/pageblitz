import { google } from "googleapis";
import { getIndexingClient } from "./auth";
import type { Site, IndexingType, GoogleIndexingResponse } from "@/types";

const INDEXING_API_URL =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";

// Google Indexing API quota: 200 requests/day per service account (default)
// Batch endpoint allows up to 100 URLs per request
const BATCH_SIZE = 100;
const RATE_LIMIT_DELAY_MS = 1000; // 1 second between batch calls

export interface IndexingResult {
  url: string;
  success: boolean;
  response?: GoogleIndexingResponse;
  error?: string;
  statusCode?: number;
}

/**
 * Submit a single URL to Google Indexing API.
 */
export async function submitUrl(
  site: Site,
  url: string,
  type: IndexingType = "URL_UPDATED"
): Promise<IndexingResult> {
  const auth = getIndexingClient(site);
  const client = await auth.getClient();

  try {
    const response = await (client as { request: Function }).request({
      url: INDEXING_API_URL,
      method: "POST",
      data: { url, type },
    });

    return {
      url,
      success: true,
      response: response.data,
      statusCode: response.status,
    };
  } catch (err: unknown) {
    const gErr = err as {
      code?: number;
      message?: string;
      response?: { status: number; data: unknown };
    };
    const statusCode = gErr.code ?? gErr.response?.status;
    return {
      url,
      success: false,
      error: gErr.message ?? "Unknown error",
      statusCode,
    };
  }
}

/**
 * Submit URLs in batches, respecting Google's batch HTTP format.
 * Returns per-URL results.
 */
export async function submitUrlsBatch(
  site: Site,
  urls: string[],
  type: IndexingType = "URL_UPDATED"
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const batchResults = await submitBatch(site, batch, type);
    results.push(...batchResults);

    if (i + BATCH_SIZE < urls.length) {
      await delay(RATE_LIMIT_DELAY_MS);
    }
  }

  return results;
}

async function submitBatch(
  site: Site,
  urls: string[],
  type: IndexingType
): Promise<IndexingResult[]> {
  // Use Google's batch HTTP endpoint for efficiency
  const auth = getIndexingClient(site);
  const client = await auth.getClient();
  const token = await auth.getAccessToken();

  const boundary = `batch_${Date.now()}`;
  const parts = urls.map(
    (url, i) =>
      `--${boundary}\r\nContent-Type: application/http\r\nContent-ID: <item${i}>\r\n\r\nPOST /v3/urlNotifications:publish\r\nContent-Type: application/json\r\n\r\n${JSON.stringify({ url, type })}`
  );
  const body = parts.join("\r\n") + `\r\n--${boundary}--`;

  try {
    const response = await fetch(
      "https://indexing.googleapis.com/batch",
      {
        method: "POST",
        headers: {
          "Content-Type": `multipart/mixed; boundary=${boundary}`,
          Authorization: `Bearer ${token}`,
        },
        body,
      }
    );

    if (!response.ok) {
      // Fallback: submit individually if batch fails
      return Promise.all(urls.map((url) => submitUrl(site, url, type)));
    }

    // Parse multipart response — map each part back to its URL
    const text = await response.text();
    return parseMultipartResponse(text, urls);
  } catch {
    // Fallback: submit individually
    return Promise.all(urls.map((url) => submitUrl(site, url, type)));
  }
}

function parseMultipartResponse(
  body: string,
  urls: string[]
): IndexingResult[] {
  // Best-effort parse — fall back to marking all as submitted if parse fails
  try {
    const lines = body.split("\r\n");
    const results: IndexingResult[] = urls.map((url) => ({
      url,
      success: false,
      error: "Parse error",
    }));

    let currentIndex = -1;
    let inBody = false;

    for (const line of lines) {
      const idMatch = line.match(/Content-ID: <item(\d+)>/i);
      if (idMatch) {
        currentIndex = parseInt(idMatch[1], 10);
        inBody = false;
      }
      if (inBody && currentIndex >= 0 && currentIndex < urls.length) {
        const statusMatch = line.match(/^HTTP\/\d\.\d (\d{3})/);
        if (statusMatch) {
          const status = parseInt(statusMatch[1], 10);
          results[currentIndex] = {
            url: urls[currentIndex],
            success: status >= 200 && status < 300,
            statusCode: status,
          };
        }
      }
      if (line === "") inBody = true;
    }

    return results;
  } catch {
    return urls.map((url) => ({ url, success: true }));
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
