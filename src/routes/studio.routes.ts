import { Router } from "express";
import {
  getAllStudios,
  getStudioById,
  createStudio,
  updateStudio,
  deleteStudio,
  getMyListings,
} from "../controllers/studio.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { mutationLimiter } from "../middleware/rateLimiter.js";
import { validateBody, studioSchema } from "../middleware/validate.js";

const router = Router();

// Public queries
router.get("/", getAllStudios);
router.get("/my-listings", requireAuth, getMyListings);
router.get("/:id", getStudioById);

// Protected mutations
router.post(
  "/",
  requireAuth,
  mutationLimiter,
  validateBody(studioSchema),
  createStudio
);

router.put(
  "/:id",
  requireAuth,
  mutationLimiter,
  validateBody(studioSchema.partial()),
  updateStudio
);

router.delete("/:id", requireAuth, mutationLimiter, deleteStudio);

export default router;
