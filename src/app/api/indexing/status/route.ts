import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("site_id");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  let query = supabase
    .from("url_submissions")
    .select(
      `
      id, url, type, status, error_message, submitted_at, created_at,
      sites!inner(user_id)
    `
    )
    .eq("sites.user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (siteId) {
    query = query.eq("site_id", siteId);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate stats
  const stats = {
    total: count ?? 0,
    submitted: data?.filter((r) => r.status === "submitted").length ?? 0,
    pending: data?.filter((r) => r.status === "pending").length ?? 0,
    error: data?.filter((r) => r.status === "error").length ?? 0,
    rate_limited: data?.filter((r) => r.status === "rate_limited").length ?? 0,
  };

  return NextResponse.json({ data, stats, limit, offset });
}
