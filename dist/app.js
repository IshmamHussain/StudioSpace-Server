"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const node_1 = require("better-auth/node");
const env_js_1 = require("./config/env.js");
const auth_js_1 = require("./config/auth.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const studio_routes_js_1 = __importDefault(require("./routes/studio.routes.js"));
const booking_routes_js_1 = __importDefault(require("./routes/booking.routes.js"));
const wishlist_routes_js_1 = __importDefault(require("./routes/wishlist.routes.js"));
const error_js_1 = require("./middleware/error.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
function createApp() {
    const app = (0, express_1.default)();
    // 1. HTTP Security Headers with Helmet
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false, // Pure JSON API
    }));
    // 2. Performance: Gzip/Brotli response compression
    app.use((0, compression_1.default)({
        threshold: 1024, // Only compress responses larger than 1KB
    }));
    // 3. CORS configuration supporting localhost, credentials, and deployment domains
    const allowedOrigins = [
        env_js_1.ENV.CLIENT_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin) ||
                origin.endsWith(".vercel.app") ||
                origin.includes("localhost")) {
                return callback(null, true);
            }
            return callback(null, true); // Dev-friendly fallback
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    }));
    // 4. Rate Limiter (Baseline DoS protection)
    app.use("/api", rateLimiter_js_1.generalLimiter);
    // 5. Better Auth Route Handler (Mounted BEFORE express.json() to preserve stream)
    app.all("/api/auth/*", (req, res, next) => {
        const path = req.path.replace("/api/auth", "");
        // Fall through for custom endpoints that require express.json body parser
        if (["/login", "/register", "/me", "/google", "/logout"].includes(path)) {
            return next();
        }
        return (0, node_1.toNodeHandler)((0, auth_js_1.getAuth)())(req, res);
    });
    // 6. Request Body Parsers (Mounted after Better Auth stream handler)
    app.use(express_1.default.json({ limit: "2mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "2mb" }));
    // 7. Cookie Parser for HTTPOnly JWT sessions
    app.use((0, cookie_parser_1.default)());
    // Root & Health check endpoints
    app.get("/", (_req, res) => {
        res.status(200).json({
            status: "healthy",
            service: "StudioSpace Backend API",
            environment: process.env.NODE_ENV || "production",
            authEngine: "BetterAuth + MongoDB Atlas + JWT",
            endpoints: {
                health: "/health",
                api: "/api",
                studios: "/api/studios",
                auth: "/api/auth",
                bookings: "/api/bookings",
                wishlist: "/api/wishlist",
            },
        });
    });
    app.get("/health", (_req, res) => {
        res.status(200).json({
            status: "healthy",
            service: "StudioSpace Backend API",
            authEngine: "BetterAuth + MongoDB Adapter + JWT",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });
    // Base API index
    app.get("/api", (_req, res) => {
        res.status(200).json({
            name: "StudioSpace API",
            version: "1.0.0",
            description: "High-Performance Peer-to-Peer Marketplace API for Creative Spaces",
            auth: {
                engine: "BetterAuth",
                adapter: "MongoDB Adapter",
                token: "JWT Plugin",
                endpoints: "/api/auth/* (sign-in, sign-up, sign-out, session, token)",
            },
            endpoints: {
                auth: "/api/auth (better-auth, register, login, google, me, logout)",
                studios: "/api/studios (GET, POST, PUT, DELETE, /my-listings)",
                bookings: "/api/bookings (POST, /my-bookings, /studio/:id, /:id/cancel)",
                wishlist: "/api/wishlist (GET, /toggle)",
            },
        });
    });
    // API Routes
    app.use("/api/auth", auth_routes_js_1.default);
    app.use("/api/studios", studio_routes_js_1.default);
    app.use("/api/bookings", booking_routes_js_1.default);
    app.use("/api/wishlist", wishlist_routes_js_1.default);
    // Error Handlers
    app.use(error_js_1.notFoundHandler);
    app.use(error_js_1.globalErrorHandler);
    return app;
}
