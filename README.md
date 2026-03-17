# PageBlitz

Submit pages directly to Google Indexing API for fast crawling. Connect your service account, paste URLs, done.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Supabase** — auth (Google OAuth) + Postgres + RLS
- **Google Indexing API v3** — official `googleapis` SDK
- **Tailwind CSS**

## How it works

1. Sign in with Google via Supabase Auth
2. Add a site + paste your Google service account JSON key
3. Submit URLs → API enqueues → worker calls Google Indexing API
4. Submission log shows real-time status per URL

## Google setup (per site)

1. Create a GCP project and enable the **Web Search Indexing API**
2. Create a **Service Account** and download the JSON key
3. In **Google Search Console**, add the service account email as an **Owner** of your property
4. Paste the JSON key into PageBlitz when adding the site

> **Quota:** Google grants 200 indexing requests/day by default. Request higher quota in GCP console.

## Local dev

```bash
cp .env.example .env.local
# Fill in Supabase keys

npm install
npm run dev
```

Run the DB migration by pasting `supabase/migrations/001_initial.sql` into the Supabase SQL editor.

## Deploy

Deploys to Vercel / any Node host. Set env vars from `.env.example`.

For production-scale queuing, swap `src/lib/queue/submission-queue.ts` for BullMQ + Redis or Inngest — the `enqueue()` interface stays the same.

## API

```
POST   /api/sites               Add a site
GET    /api/sites               List sites
DELETE /api/sites?id=<uuid>     Remove a site

POST   /api/indexing/submit     Submit URLs
  body: { site_id, urls: string[], type: "URL_UPDATED"|"URL_DELETED" }

GET    /api/indexing/status     Submission log
  ?site_id=<uuid>&limit=50&offset=0
```
