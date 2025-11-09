import express from "express";
import { query } from "../snowflakeconnection.js";

const router = express.Router();

router.post("/track", async (req, res) => {
  const event = req.body;

  const insertSQL = `
    INSERT INTO EVENTS_RAW (record, _filename)
    SELECT PARSE_JSON(?), ?;
  `;

  try {
    await query(insertSQL, [JSON.stringify(event), `api_${Date.now()}.json`]);
    res.status(204).send(); // success, no content
  } catch (err) {
    console.error("Insert error:", err.message);
    res.status(500).json({ error: "Snowflake insert failed" });
  }
});

// Add a GET route for /api/
router.get("/", (req, res) => {
  res.json({ 
    message: "Events API is working!",
    endpoints: {
      track: "POST /api/track"
    }
  });
});

export default router;