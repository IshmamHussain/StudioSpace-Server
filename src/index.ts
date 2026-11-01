import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";

async function bootstrap() {
  const app = createApp();

  // Connect to MongoDB Atlas (with in-memory fallback on failure/timeout)
  await connectDB();

  app.listen(ENV.PORT, () => {
    console.log(`
╔═════════════════════════════════════════════════════════════════╗
║                                                                 ║
║   ⚡ STUDIOSPACE BACKEND API SERVER RUNNING                      ║
║   URL: http://localhost:${ENV.PORT}                                   ║
║   Status: Ready for Creative Creators & Hosts                   ║
║   HTTPOnly JWT Authentication: ACTIVE                           ║
║   Double-Booking Collision Engine: ACTIVE                       ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝
    `);
  });
}

bootstrap().catch(err => {
  console.error("Fatal error during bootstrap:", err);
  process.exit(1);
});

