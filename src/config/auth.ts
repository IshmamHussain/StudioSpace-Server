import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { memoryAdapter } from "better-auth/adapters/memory";
import { jwt } from "better-auth/plugins";
import { Db } from "mongodb";
import { getDB } from "./db.js";
import { ENV } from "./env.js";

let authInstance: any = null;

function createBetterAuthInstance(db?: Db | null) {
  const database = db || getDB();
  const adapter = database ? mongodbAdapter(database) : memoryAdapter({});

  return betterAuth({
    database: adapter,
    secret: ENV.JWT_SECRET || "studiospace_secure_betterauth_jwt_secret_token_2026",
    baseURL:
      process.env.BETTER_AUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5000"),
    trustedOrigins: [
      ENV.CLIENT_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://studio-space-rho.vercel.app",
      "https://studio-space-rho.vercel.app/",
    ],
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    },
    onAPIError: {
      errorURL: "https://studio-space-rho.vercel.app/login",
    },
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
      jwt({
        // BetterAuth JWT plugin for cross-service tokens and JWKS verification
      }),
    ],
  });
}

export function getAuth(): any {
  if (!authInstance) {
    authInstance = createBetterAuthInstance();
  }
  return authInstance;
}

export function reinitAuthWithDb(database: Db): any {
  authInstance = createBetterAuthInstance(database);
  return authInstance;
}
