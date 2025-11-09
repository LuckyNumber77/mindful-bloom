import snowflake from "snowflake-sdk";

// Create and connect a single Snowflake connection
export const sfConnection = snowflake.createConnection({
  account: process.env.SF_ACCOUNT,          // e.g. xy12345.ca-central-1
  username: process.env.SF_USER,            // MINDFUL_APP_USER
  password: process.env.SF_PASSWORD,        // monkey (or your password)
  warehouse: "COMPUTE_WH",
  role: "MINDFUL_APP_ROLE",
  database: "MINDFUL_BLOOM",
  schema: "RAW",
});

sfConnection.connect((err) => {
  if (err) console.error("❌ Snowflake connection error:", err);
  else console.log("✅ Connected to Snowflake");
});
