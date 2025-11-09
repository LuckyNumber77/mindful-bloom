import { Router } from 'express';
import { query } from '../snowflakeconnection.js';

const router = Router();

// GET /api/stats/moods?days=7|14|30
router.get('/moods', async (req, res) => {
  const days = Math.min(parseInt(req.query.days || '7', 10), 90);

  const rows = await query(
    `
    WITH recent AS (
      SELECT
        EVENT_NAME,
        COALESCE(
          PROPERTIES:mood::string,
          PROPERTIES:inferredMood::string
        ) AS MOOD,
        DATE_TRUNC('day', COALESCE(CLIENT_TS, CREATED_AT)) AS DAY
      FROM EVENTS
      WHERE CREATED_AT >= DATEADD(day, -?, CURRENT_TIMESTAMP())
        AND EVENT_NAME IN (
          'mood_selected',        -- legacy (if any)
          'checkin_completed',    -- legacy (if any)
          'checkin.created',      -- current check-ins
          'chat_message'          -- chat with inferredMood
        )
    )
    SELECT DAY, MOOD, COUNT(*) AS CNT
    FROM recent
    WHERE MOOD IS NOT NULL
    GROUP BY DAY, MOOD
    ORDER BY DAY DESC, CNT DESC
    `,
    [days]
  );

  res.json(rows);
});

// GET /api/stats/points  -> total reward points from reward.earned events
router.get('/points', async (_req, res) => {
  const rows = await query(
    `SELECT COALESCE(SUM(TRY_TO_NUMBER(PROPERTIES:points::string)), 0) AS POINTS
     FROM EVENTS
     WHERE EVENT_NAME = 'reward.earned'`
  );
  const points = rows?.[0]?.POINTS ?? 0;
  res.json({ points });
});

// Add a GET route for /api/stats
router.get("/", (req, res) => {
  res.json({ 
    message: "Stats API is working!",
    endpoints: {
      moods: "GET /api/stats/moods?days=7",
      points: "GET /api/stats/points"
    }
  });
});

export default router;