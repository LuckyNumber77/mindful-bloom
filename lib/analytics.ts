// src/lib/analytics.ts

// Known analytics events
export type AnalyticsEvent =
  | { type: "checkin.created"; date: string; mood: string; userId?: string }
  | { type: "task.toggled"; date: string; taskId: string; completed: boolean; userId?: string }
  | { type: "journal.created"; date: string; entryId: string; length: number; userId?: string }
  | { type: "reward.completed_day"; date: string; userId?: string }
  | { type: "game.played"; game: string; score: number; userId?: string }
  | { type: "reward.earned"; reason: string; points: number; userId?: string };

const API_BASE = import.meta.env.VITE_API_URL ?? ""; // e.g. http://localhost:3000 (or empty when using Vite proxy)
const TRACK_URL = `${API_BASE}/api/track`;

export async function track(event: AnalyticsEvent) {
  try {
    await fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        userId: event.userId ?? "local-user",
        event: event.type,        // what the server expects
        properties: event,        // stored in PROPERTIES
        clientTs: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn("Analytics event failed:", err);
  }
}
