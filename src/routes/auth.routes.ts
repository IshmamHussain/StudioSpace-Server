import { Router } from "express";
import { register, login, googleAuth, getMe, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validateBody, registerSchema, loginSchema, googleAuthSchema } from "../middleware/validate.js";

const router = Router();

// Apply auth rate limiter and Zod validation schemas
router.post("/register", authLimiter, validateBody(registerSchema), register);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post("/google", authLimiter, validateBody(googleAuthSchema), googleAuth);
router.get("/me", requireAuth, getMe);
router.post("/logout", logout);

export default router;
