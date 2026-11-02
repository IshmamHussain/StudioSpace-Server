import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import { ENV } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import studioRoutes from "./routes/studio.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/error.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

export function createApp(): Express {
  const app = express();

  // 1. HTTP Security Headers with Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false, // Pure JSON API
    })
  );

  // 2. Performance: Gzip/Brotli response compression
  app.use(
    compression({
      threshold: 1024, // Only compress responses larger than 1KB
    })
  );

  // 3. Rate Limiter (Baseline DoS protection)
  app.use("/api", generalLimiter);

  // 4. Request Body Parsers with defensive limits
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // 5. Cookie Parser for HTTPOnly JWT sessions
  app.use(cookieParser());

  // 6. CORS configuration supporting localhost, credentials, and deployment domains
  const allowedOrigins = [
    ENV.CLIENT_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith(".vercel.app") ||
          origin.includes("localhost")
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Dev-friendly fallback
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    })
  );

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "StudioSpace Backend API",
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
      endpoints: {
        auth: "/api/auth (register, login, google, me, logout)",
        studios: "/api/studios (GET, POST, PUT, DELETE, /my-listings)",
        bookings: "/api/bookings (POST, /my-bookings, /studio/:id, /:id/cancel)",
        wishlist: "/api/wishlist (GET, /toggle)",
      },
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/studios", studioRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/wishlist", wishlistRoutes);

  // Error Handlers
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
