import { Router } from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.get("/", requireAuth, getWishlist);
router.post("/toggle", requireAuth, toggleWishlist);
export default router;
