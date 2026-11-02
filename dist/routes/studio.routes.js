"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const studio_controller_js_1 = require("../controllers/studio.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const validate_js_1 = require("../middleware/validate.js");
const router = (0, express_1.Router)();
// Public queries
router.get("/", studio_controller_js_1.getAllStudios);
router.get("/my-listings", auth_js_1.requireAuth, studio_controller_js_1.getMyListings);
router.get("/:id", studio_controller_js_1.getStudioById);
// Protected mutations
router.post("/", auth_js_1.requireAuth, rateLimiter_js_1.mutationLimiter, (0, validate_js_1.validateBody)(validate_js_1.studioSchema), studio_controller_js_1.createStudio);
router.put("/:id", auth_js_1.requireAuth, rateLimiter_js_1.mutationLimiter, (0, validate_js_1.validateBody)(validate_js_1.studioSchema.partial()), studio_controller_js_1.updateStudio);
router.delete("/:id", auth_js_1.requireAuth, rateLimiter_js_1.mutationLimiter, studio_controller_js_1.deleteStudio);
exports.default = router;
