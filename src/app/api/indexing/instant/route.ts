import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { google } from "googleapis";

const Schema = z.object({
  service_account_key: z.object({
    type: z.literal("service_account"),
    client_email: z.string().email(),
    private_key: z.string().min(1),
  }, { message: "Must be a valid service_account JSON key" }),
  urls: z.array(z.string().url()).min(1).max(200),
  type: z.enum(["URL_UPDATED", "URL_DELETED"]).default("URL_UPDATED"),
});

const INDEXING_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { service_account_key, urls, type } = parsed.data;

  // Build auth from the provided service account — never stored
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: service_account_key.client_email,
      private_key: service_account_key.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });

  let token: string;
  try {
    token = (await auth.getAccessToken()) as string;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to authenticate with Google";
    return NextResponse.json(
      { error: `Service account auth failed: ${msg}` },
      { status: 401 }
    );
  }

  // Submit each URL (parallelised, capped to respect quota)
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(INDEXING_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url, type }),
        });

        if (res.ok) {
          return { url, success: true, statusCode: res.status };
        }

        const errBody = await res.json().catch(() => ({}));
        return {
          url,
          success: false,
          statusCode: res.status,
          error: (errBody as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`,
        };
      } catch (err: unknown) {
        return {
          url,
          success: false,
          error: err instanceof Error ? err.message : "Network error",
        };
      }
    })
  );

  return NextResponse.json({ results });
}
