"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.setAuthCookie = setAuthCookie;
exports.clearAuthCookie = clearAuthCookie;
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_1 = require("better-auth/node");
const auth_js_1 = require("../config/auth.js");
const env_js_1 = require("../config/env.js");
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_js_1.ENV.JWT_SECRET, { expiresIn: "7d" });
}
function setAuthCookie(res, token) {
    const isProduction = env_js_1.ENV.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
    });
}
function clearAuthCookie(res) {
    const isProduction = env_js_1.ENV.NODE_ENV === "production";
    res.cookie("token", "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        expires: new Date(0),
        path: "/",
    });
}
/**
 * Authentication guard using Better Auth session resolution with JWT bearer token support.
 * Rejects unauthorized mutation requests with 401 Unauthorized.
 */
async function requireAuth(req, res, next) {
    const auth = (0, auth_js_1.getAuth)();
    try {
        // 1. Resolve session via Better Auth headers
        const session = await auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        if (session && session.user) {
            req.user = {
                userId: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role || "creator",
            };
            next();
            return;
        }
    }
    catch {
        // Continue to check JWT token fallback
    }
    // 2. Token verification via Better Auth JWT / HTTPOnly Cookie / Bearer header
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
        try {
            // Check using Better Auth JWT verification first
            const verified = await auth.api.verifyJWT?.({ token }).catch(() => null);
            if (verified && verified.sub) {
                req.user = {
                    userId: verified.sub,
                    email: verified.email || "",
                    name: verified.name || "Creator",
                    role: verified.role || "creator",
                };
                next();
                return;
            }
            // Standard fallback verification
            const decoded = jsonwebtoken_1.default.verify(token, env_js_1.ENV.JWT_SECRET);
            req.user = decoded;
            next();
            return;
        }
        catch {
            // Token invalid
        }
    }
    res.status(401).json({
        success: false,
        message: "Unauthorized: Missing authentication token or session. Please log in to perform this action.",
    });
}
/**
 * Optional authentication: attaches user if token/session is valid, but does not block if missing
 */
async function optionalAuth(req, _res, next) {
    const auth = (0, auth_js_1.getAuth)();
    try {
        const session = await auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        if (session && session.user) {
            req.user = {
                userId: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role || "creator",
            };
            next();
            return;
        }
    }
    catch {
        // Ignore error in optional auth
    }
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_js_1.ENV.JWT_SECRET);
            req.user = decoded;
        }
        catch {
            // Ignore token verification error for optional auth
        }
    }
    next();
}
