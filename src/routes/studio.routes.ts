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

const router = Router();

// Public routes
router.get("/", getAllStudios);
router.get("/my-listings", requireAuth, getMyListings);
router.get("/:id", getStudioById);

// Protected routes (HTTPOnly JWT mutation guard)
router.post("/", requireAuth, createStudio);
router.put("/:id", requireAuth, updateStudio);
router.delete("/:id", requireAuth, deleteStudio);

export default router;

