"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const validate_js_1 = require("../middleware/validate.js");
const router = (0, express_1.Router)();
// Apply auth rate limiter and Zod validation schemas
router.post("/register", rateLimiter_js_1.authLimiter, (0, validate_js_1.validateBody)(validate_js_1.registerSchema), auth_controller_js_1.register);
router.post("/login", rateLimiter_js_1.authLimiter, (0, validate_js_1.validateBody)(validate_js_1.loginSchema), auth_controller_js_1.login);
router.post("/google", rateLimiter_js_1.authLimiter, (0, validate_js_1.validateBody)(validate_js_1.googleAuthSchema), auth_controller_js_1.googleAuth);
router.get("/me", auth_js_1.requireAuth, auth_controller_js_1.getMe);
router.post("/logout", auth_controller_js_1.logout);
exports.default = router;
