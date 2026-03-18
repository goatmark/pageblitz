import { NextResponse } from "next/server";

export async function GET() {
  const email = process.env.GOOGLE_CLIENT_EMAIL ?? null;
  return NextResponse.json({ saEmail: email });
}
