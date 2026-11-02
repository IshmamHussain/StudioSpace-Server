"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuth = getAuth;
exports.reinitAuthWithDb = reinitAuthWithDb;
const better_auth_1 = require("better-auth");
const mongodb_1 = require("better-auth/adapters/mongodb");
const memory_1 = require("better-auth/adapters/memory");
const plugins_1 = require("better-auth/plugins");
const db_js_1 = require("./db.js");
const env_js_1 = require("./env.js");
let authInstance = null;
function createBetterAuthInstance(db) {
    const database = db || (0, db_js_1.getDB)();
    const adapter = database ? (0, mongodb_1.mongodbAdapter)(database) : (0, memory_1.memoryAdapter)({});
    return (0, better_auth_1.betterAuth)({
        database: adapter,
        secret: env_js_1.ENV.JWT_SECRET || "studiospace_secure_betterauth_jwt_secret_token_2026",
        baseURL: process.env.BETTER_AUTH_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5000"),
        trustedOrigins: [
            env_js_1.ENV.CLIENT_URL,
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://studio-space-rho.vercel.app",
        ],
        emailAndPassword: {
            enabled: true,
            minPasswordLength: 6,
        },
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID || "",
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            },
        },
        user: {
            additionalFields: {
                role: {
                    type: "string",
                    required: false,
                    defaultValue: "creator",
                },
                photoURL: {
                    type: "string",
                    required: false,
                },
            },
        },
        plugins: [
            (0, plugins_1.jwt)({
            // BetterAuth JWT plugin for cross-service tokens and JWKS verification
            }),
        ],
    });
}
function getAuth() {
    if (!authInstance) {
        authInstance = createBetterAuthInstance();
    }
    return authInstance;
}
function reinitAuthWithDb(database) {
    authInstance = createBetterAuthInstance(database);
    return authInstance;
}
