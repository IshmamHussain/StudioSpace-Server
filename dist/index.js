"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const db_js_1 = require("./config/db.js");
const auth_js_1 = require("./config/auth.js");
const env_js_1 = require("./config/env.js");
async function bootstrap() {
    // Connect to MongoDB Atlas (or in-memory fallback on connection timeout)
    const db = await (0, db_js_1.connectDB)();
    if (db) {
        (0, auth_js_1.reinitAuthWithDb)(db);
    }
    const app = (0, app_js_1.createApp)();
    app.listen(env_js_1.ENV.PORT, () => {
        console.log(`
╔═════════════════════════════════════════════════════════════════╗
║                                                                 ║
║   ⚡ STUDIOSPACE BACKEND API SERVER RUNNING                      ║
║   URL: http://localhost:${env_js_1.ENV.PORT}                                   ║
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
