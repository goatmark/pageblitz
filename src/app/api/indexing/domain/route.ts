import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { google } from "googleapis";

const Schema = z.object({
  urls: z.array(z.string().url()).min(1).max(500),
  type: z.enum(["URL_UPDATED", "URL_DELETED"]).default("URL_UPDATED"),
});

const INDEXING_URL =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";

function getServiceAccountAuth() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!keyJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not configured");
  }

  const key = JSON.parse(keyJson);
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  let token: string;
  try {
    const auth = getServiceAccountAuth();
    token = (await auth.getAccessToken()) as string;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Auth failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { urls, type } = parsed.data;

  // Parallelise submissions — Google recommends max 100 concurrent
  const CHUNK = 100;
  const results: { url: string; success: boolean; error?: string; statusCode?: number }[] = [];

  for (let i = 0; i < urls.length; i += CHUNK) {
    const chunk = urls.slice(i, i + CHUNK);
    const chunkResults = await Promise.all(
      chunk.map(async (url) => {
        try {
          const res = await fetch(INDEXING_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ url, type }),
          });

          if (res.ok) return { url, success: true, statusCode: res.status };

          const err = await res.json().catch(() => ({}));
          return {
            url,
            success: false,
            statusCode: res.status,
            error:
              (err as { error?: { message?: string } }).error?.message ??
              `HTTP ${res.status}`,
          };
        } catch (e: unknown) {
          return {
            url,
            success: false,
            error: e instanceof Error ? e.message : "Network error",
          };
        }
      })
    );
    results.push(...chunkResults);
  }

  const succeeded = results.filter((r) => r.success).length;
  return NextResponse.json({ results, succeeded, total: results.length });
}
