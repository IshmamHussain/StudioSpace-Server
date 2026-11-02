import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { reinitAuthWithDb } from "./config/auth.js";
import { ENV } from "./config/env.js";
async function bootstrap() {
    // Connect to MongoDB Atlas (or in-memory fallback on connection timeout)
    const db = await connectDB();
    if (db) {
        reinitAuthWithDb(db);
    }
    const app = createApp();
    app.listen(ENV.PORT, () => {
        console.log(`
╔═════════════════════════════════════════════════════════════════╗
║                                                                 ║
║   ⚡ STUDIOSPACE BACKEND API SERVER RUNNING                      ║
║   URL: http://localhost:${ENV.PORT}                                   ║
║   Authentication: BetterAuth + MongoDB Adapter + JWT            ║
║   Status: Ready for Creative Creators & Hosts                   ║
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
