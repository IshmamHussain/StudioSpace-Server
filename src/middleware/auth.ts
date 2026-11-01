import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
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
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "7d" });
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
 * Protect server-side mutations by validating JWT stored in HTTPOnly cookie
 * (or Bearer token fallback for testing tools).
 * Rejects unauthorized requests with 401 Unauthorized.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  let token = req.cookies?.token;

  // Support Bearer authorization header fallback for Postman / API testers
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Missing authentication token. Please log in to perform this action.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: Session expired or invalid token. Please log in again.",
    });
  }
}

/**
 * Optional authentication: attaches user if token is valid, but does not block if missing
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
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

