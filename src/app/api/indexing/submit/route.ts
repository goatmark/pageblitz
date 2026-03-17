import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enqueue } from "@/lib/queue/submission-queue";

const SubmitSchema = z.object({
  site_id: z.string().uuid(),
  urls: z
    .array(z.string().url())
    .min(1, "At least one URL required")
    .max(200, "Max 200 URLs per request"),
  type: z.enum(["URL_UPDATED", "URL_DELETED"]).default("URL_UPDATED"),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { site_id, urls, type } = parsed.data;

  // Verify user owns this site
  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("id")
    .eq("id", site_id)
    .eq("user_id", user.id)
    .single();

  if (siteError || !site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Deduplicate URLs
  const uniqueUrls = [...new Set(urls)];

  // Enqueue — returns immediately, processing is async
  await enqueue({ siteId: site_id, urls: uniqueUrls, type });

  return NextResponse.json({
    queued: uniqueUrls.length,
    message: `${uniqueUrls.length} URL(s) queued for indexing`,
  });
}
