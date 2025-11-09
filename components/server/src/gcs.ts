// src/gcs.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

/**
 * Creates a simple helper to write newline-delimited JSON (NDJSON) files
 * to a GCS bucket. Snowpipe can then auto-ingest these files.
 */
const bucketName = process.env.GCS_BUCKET!;
if (!bucketName) {
  console.warn("⚠️  GCS_BUCKET env variable is not set — analytics won't be saved.");
}

const storage = new Storage();
const bucket = bucketName ? storage.bucket(bucketName) : null;

/**
 * Writes one or more analytics events to GCS as NDJSON.
 */
export async function writeAnalyticsEvents(events: any[]): Promise<string | null> {
  if (!bucket) return null;

  const now = new Date();
  const datePath = now.toISOString().split("T")[0]; // e.g. 2025-11-08
  const fileName = `analytics/dt=${datePath}/${now.getTime()}-${randomUUID()}.ndjson`;

  const payload = events.map(e => JSON.stringify(e)).join("\n") + "\n";

  await bucket.file(fileName).save(payload, {
    resumable: false,
    contentType: "application/x-ndjson",
  });

  console.log(`🪣 Wrote analytics batch to GCS: ${fileName}`);
  return fileName;
}
