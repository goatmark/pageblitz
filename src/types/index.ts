export type IndexingType = "URL_UPDATED" | "URL_DELETED";

export type SubmissionStatus =
  | "pending"
  | "submitted"
  | "error"
  | "rate_limited";

export interface Site {
  id: string;
  user_id: string;
  domain: string;
  service_account_email: string;
  service_account_key_json: string; // encrypted at rest
  created_at: string;
  updated_at: string;
}

export interface UrlSubmission {
  id: string;
  site_id: string;
  url: string;
  type: IndexingType;
  status: SubmissionStatus;
  google_response: Record<string, unknown> | null;
  error_message: string | null;
  submitted_at: string | null;
  created_at: string;
}

export interface SubmitUrlsPayload {
  site_id: string;
  urls: string[];
  type?: IndexingType;
}

export interface GoogleIndexingResponse {
  urlNotificationMetadata: {
    url: string;
    latestUpdate: {
      url: string;
      type: IndexingType;
      notifyTime: string;
    };
  };
}
