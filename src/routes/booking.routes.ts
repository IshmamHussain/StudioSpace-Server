import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getStudioBookings,
} from "../controllers/booking.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/studio/:studioId", getStudioBookings);
router.post("/", requireAuth, createBooking);
router.get("/my-bookings", requireAuth, getMyBookings);
router.patch("/:id/cancel", requireAuth, cancelBooking);

export default router;

