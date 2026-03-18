import { NextResponse } from "next/server";

export async function GET() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!keyJson) {
    return NextResponse.json({ saEmail: null });
  }
  try {
    const key = JSON.parse(keyJson);
    return NextResponse.json({ saEmail: key.client_email ?? null });
  } catch {
    return NextResponse.json({ saEmail: null });
  }
}
