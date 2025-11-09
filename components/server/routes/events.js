import express from "express";
import { sfConnection } from "../snowflakeconnection.js";

const router = express.Router();

router.post("/track", (req, res) => {
  const event = req.body;

  const insertSQL = `
    INSERT INTO EVENTS_RAW (record, _filename)
    SELECT PARSE_JSON(?), ?;
  `;

  sfConnection.execute({
    sqlText: insertSQL,
    binds: [JSON.stringify(event), `api_${Date.now()}.json`],
    complete: (err) => {
      if (err) {
        console.error("Insert error:", err.message);
        return res.status(500).json({ error: "Snowflake insert failed" });
      }
      res.status(204).send(); // success, no content
    },
  });
});

export default router;
