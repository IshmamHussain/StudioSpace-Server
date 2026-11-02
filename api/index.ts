import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { reinitAuthWithDb } from "../src/config/auth.js";

const app = createApp();

let dbInitialized = false;

app.use(async (_req, _res, next) => {
  if (!dbInitialized) {
    try {
      const db = await connectDB();
      if (db) {
        reinitAuthWithDb(db);
      }
      dbInitialized = true;
    } catch (err: any) {
      console.error("Vercel serverless database initialization notice:", err?.message);
    }
  }
  next();
});

export default app;
