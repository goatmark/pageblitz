import { google } from "googleapis";
import type { Site } from "@/types";

/**
 * Creates an authenticated Google OAuth2 client from a site's service account.
 * The service account must have the site verified in Google Search Console
 * and the Indexing API enabled in their GCP project.
 */
export function getIndexingClient(site: Site) {
  let keyData: { client_email: string; private_key: string };

  try {
    keyData = JSON.parse(site.service_account_key_json);
  } catch {
    throw new Error(`Invalid service account JSON for site ${site.domain}`);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: keyData.client_email,
      private_key: keyData.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });

  return auth;
}

/**
 * Validates a service account JSON blob has the required fields.
 */
export function validateServiceAccount(json: string): {
  valid: boolean;
  email?: string;
  error?: string;
} {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) {
      return { valid: false, error: "Missing client_email or private_key" };
    }
    if (parsed.type !== "service_account") {
      return { valid: false, error: "JSON type must be service_account" };
    }
    return { valid: true, email: parsed.client_email };
  } catch {
    return { valid: false, error: "Invalid JSON" };
  }
}
