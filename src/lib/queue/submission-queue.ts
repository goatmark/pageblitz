/**
 * Submission queue — processes URL batches asynchronously.
 *
 * In production, swap this for a proper queue (BullMQ + Redis, Inngest, etc.).
 * This in-process implementation is suitable for small scale / single instance.
 */

import { createServiceClient } from "@/lib/supabase/server";
import { submitUrlsBatch } from "@/lib/google/indexing";
import type { Site, IndexingType } from "@/types";

interface QueueJob {
  siteId: string;
  urls: string[];
  type: IndexingType;
}

// Simple in-memory queue with sequential processing
const queue: QueueJob[] = [];
let processing = false;

export async function enqueue(job: QueueJob) {
  queue.push(job);
  if (!processing) {
    processNext();
  }
}

async function processNext() {
  if (queue.length === 0) {
    processing = false;
    return;
  }

  processing = true;
  const job = queue.shift()!;

  try {
    await processJob(job);
  } catch (err) {
    console.error("[queue] Job failed:", err);
  }

  processNext();
}

async function processJob(job: QueueJob) {
  const supabase = createServiceClient();

  // Fetch site with service account credentials
  const { data: site, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", job.siteId)
    .single();

  if (error || !site) {
    console.error("[queue] Site not found:", job.siteId);
    await markAllError(job, "Site not found");
    return;
  }

  // Insert pending submission rows
  const rows = job.urls.map((url) => ({
    site_id: job.siteId,
    url,
    type: job.type,
    status: "pending" as const,
  }));

  const { data: insertedRows, error: insertError } = await supabase
    .from("url_submissions")
    .insert(rows)
    .select("id, url");

  if (insertError) {
    console.error("[queue] Failed to insert submissions:", insertError);
    return;
  }

  // Build url→id map for updating after submission
  const urlToId = new Map(insertedRows!.map((r: { id: string; url: string }) => [r.url, r.id]));

  // Submit to Google
  const results = await submitUrlsBatch(site as Site, job.urls, job.type);

  // Update each row based on result
  await Promise.all(
    results.map(async (result) => {
      const id = urlToId.get(result.url);
      if (!id) return;

      if (result.success) {
        await supabase
          .from("url_submissions")
          .update({
            status: "submitted",
            google_response: result.response ?? null,
            submitted_at: new Date().toISOString(),
          })
          .eq("id", id);
      } else {
        const isRateLimit = result.statusCode === 429;
        await supabase
          .from("url_submissions")
          .update({
            status: isRateLimit ? "rate_limited" : "error",
            error_message: result.error ?? null,
          })
          .eq("id", id);
      }
    })
  );

  console.log(
    `[queue] Processed ${results.length} URLs for site ${job.siteId}: ` +
      `${results.filter((r) => r.success).length} ok, ` +
      `${results.filter((r) => !r.success).length} failed`
  );
}

async function markAllError(job: QueueJob, message: string) {
  const supabase = createServiceClient();
  await supabase.from("url_submissions").insert(
    job.urls.map((url) => ({
      site_id: job.siteId,
      url,
      type: job.type,
      status: "error",
      error_message: message,
    }))
  );
}
