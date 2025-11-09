import express from "express";
import morgan from "morgan";
import cors from "cors";
import { writeAnalyticsEvents } from "./gcs"; // uses src/gcs.ts

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));
app.use(morgan("dev"));

const GCS_BUCKET = process.env.GCS_BUCKET || "";

/** Health check */
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    gcsBucketConfigured: Boolean(GCS_BUCKET),
  });
});

/** Receive analytics events from client and persist to GCS as NDJSON. */
app.post("/analytics", async (req, res) => {
  const event = req.body;

  if (!event || typeof event !== "object") {
    return res.status(400).json({ error: "bad_request" });
  }

  try {
    // If GCS isn’t configured yet, just log (dev mode)
    if (!GCS_BUCKET) {
      console.log("analytics (dev mode):", event);
      return res.sendStatus(204);
    }

    const fileName = await writeAnalyticsEvents([event]);
    if (fileName) {
      console.log("analytics saved:", fileName);
    }
    return res.sendStatus(204);
  } catch (err) {
    console.error("analytics_write_failed:", err);
    return res.status(500).json({ error: "write_failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
