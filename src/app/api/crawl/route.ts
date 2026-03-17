import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { crawlSitemap } from "@/lib/sitemap";

const Schema = z.object({
  domain: z.string().url("Must be a valid URL including https://"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid domain" },
      { status: 400 }
    );
  }

  const result = await crawlSitemap(parsed.data.domain);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({
    urls: result.urls,
    count: result.urls.length,
    sitemaps: result.sitemapsFound,
  });
}
