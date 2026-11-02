import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { fromNodeHeaders } from "better-auth/node";
import { getAuth } from "../config/auth.js";
import { ENV } from "../config/env.js";
import { AuthTokenPayload } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function signToken(payload: AuthTokenPayload): string {
  const jwtFn = (jwt as any)?.sign ? (jwt as any) : (jwt as any)?.default || jwt;
  return jwtFn.sign(payload, ENV.JWT_SECRET, { expiresIn: "7d", algorithm: "HS256" });
}

export function setAuthCookie(res: Response, token: string): void {
  const isProduction = ENV.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  const isProduction = ENV.NODE_ENV === "production";
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
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth();

  try {
    // 1. Resolve session via Better Auth headers
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session && session.user) {
      req.user = {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role || "creator",
      };
      next();
      return;
    }
  } catch {
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
      const verified = await (auth.api as any).verifyJWT?.({ token }).catch(() => null);
      if (verified && (verified as any).sub) {
        req.user = {
          userId: (verified as any).sub,
          email: (verified as any).email || "",
          name: (verified as any).name || "Creator",
          role: (verified as any).role || "creator",
        };
        next();
        return;
      }

      // Standard fallback verification with fixed HS256 algorithm enforcement
      const jwtFn = (jwt as any)?.verify ? (jwt as any) : (jwt as any)?.default || jwt;
      const decoded = jwtFn.verify(token, ENV.JWT_SECRET, { algorithms: ["HS256"] }) as AuthTokenPayload;
      req.user = decoded;
      next();
      return;
    } catch {
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
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth();

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session && session.user) {
      req.user = {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role || "creator",
      };
      next();
      return;
    }
  } catch {
    // Ignore error in optional auth
  }

  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;
      req.user = decoded;
    } catch {
      // Ignore token verification error for optional auth
    }
  }

  next();
}
