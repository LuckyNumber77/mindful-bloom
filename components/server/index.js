// 1) Load env first
import "dotenv/config";

// 2) Deps
import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.js";
import statsRoutes from "./routes/stats.js";

// 3) App
const app = express();

// 3a) CORS (open now; later restrict to your Vercel domain)
app.use(
  cors({
    origin: "*",            // e.g. ["https://mindful-bloom.vercel.app"]
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
  })
);

app.use(express.json());

// 3b) Health check (Render pings this, and you can test quickly)
app.get("/health", (_req, res) => res.json({ ok: true }));

// 3c) Root route
app.get("/", (_req, res) => {
  res.json({ 
    message: "Mindful Bloom API is running!",
    endpoints: {
      health: "/health",
      stats: "/api/stats", 
      events: "/api/"
    }
  });
});

// 4) Routes
app.use("/api/stats", statsRoutes);
app.use("/api", eventsRouter);

// 5) Env sanity
console.log("✅ Snowflake account loaded:", process.env.SF_ACCOUNT || "(missing)");

// 6) Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app; // (harmless for Node; useful if you ever test/import)