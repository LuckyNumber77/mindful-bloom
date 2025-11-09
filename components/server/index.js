// 1️⃣ Load environment variables first
import 'dotenv/config';

// 2️⃣ Import dependencies
import express from "express";
import eventsRouter from "./routes/events.js";
import statsRoutes from './routes/stats.js';

// 3️⃣ Create the Express app
const app = express();
app.use(express.json());
app.use('/api/stats', statsRoutes);
app.use("/api", eventsRouter);

// 4️⃣ Verify .env loaded correctly
console.log("✅ Snowflake account loaded:", process.env.SF_ACCOUNT);

// 5️⃣ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
