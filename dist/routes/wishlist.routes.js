"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_controller_js_1 = require("../controllers/wishlist.controller.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.get("/", auth_js_1.requireAuth, wishlist_controller_js_1.getWishlist);
router.post("/toggle", auth_js_1.requireAuth, wishlist_controller_js_1.toggleWishlist);
exports.default = router;
