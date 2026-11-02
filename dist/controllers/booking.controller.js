import { ObjectId } from "mongodb";
import { getDB, isDbConnected, inMemoryStore } from "../config/db.js";
/**
 * Checks whether two time windows [s1, e1) and [s2, e2) overlap on the same date.
 * Assumes format "HH:MM".
 */
export function doTimesOverlap(s1, e1, s2, e2) {
    return s1 < e2 && e1 > s2;
}
export async function createBooking(req, res) {
    try {
        const user = req.user;
        const { studioId, bookingDate, startTime, endTime, notes, } = req.body;
        if (!studioId || !bookingDate || !startTime || !endTime) {
            res.status(400).json({
                success: false,
                message: "Studio ID, booking date, start time, and end time are required.",
            });
            return;
        }
        if (startTime >= endTime) {
            res.status(400).json({
                success: false,
                message: "End time must be later than start time.",
            });
            return;
        }
        // 1. Fetch Studio to get current hourly rate, security deposit, owner info
        let studio = null;
        if (isDbConnected() && getDB()) {
            const db = getDB();
            let query = {};
            if (ObjectId.isValid(studioId)) {
                query = { _id: new ObjectId(studioId) };
            }
            else {
                query = { _id: studioId };
            }
            studio = await db.collection("studios").findOne(query);
        }
        else {
            studio = inMemoryStore.studios.find(s => s._id.toString() === studioId);
        }
        if (!studio) {
            res.status(404).json({ success: false, message: "Studio workspace does not exist." });
            return;
        }
        // 2. Interval collision check: prevent overlapping confirmed reservations
        // Check against existing "Confirmed" bookings for the exact same studio and date
        if (isDbConnected() && getDB()) {
            const db = getDB();
            let studioQueryId = studioId;
            if (ObjectId.isValid(studioId)) {
                studioQueryId = new ObjectId(studioId);
            }
            const collision = await db.collection("bookings").findOne({
                $or: [{ studioId: studioQueryId }, { studioId: studioId }],
                bookingDate,
                status: "Confirmed",
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
            });
            if (collision) {
                res.status(409).json({
                    success: false,
                    message: `Booking collision: Studio "${studio.title}" is already confirmed from ${collision.startTime} to ${collision.endTime} on ${bookingDate}. Please select another time slot.`,
                });
                return;
            }
        }
        else {
            // In-memory collision check
            const collision = inMemoryStore.bookings.find(b => b.studioId.toString() === studioId &&
                b.bookingDate === bookingDate &&
                b.status === "Confirmed" &&
                doTimesOverlap(b.startTime, b.endTime, startTime, endTime));
            if (collision) {
                res.status(409).json({
                    success: false,
                    message: `Booking collision: Studio "${studio.title}" is already confirmed from ${collision.startTime} to ${collision.endTime} on ${bookingDate}. Please select another time slot.`,
                });
                return;
            }
        }
        // 3. Compute pricing breakdown
        const [sHour, sMin] = startTime.split(":").map(Number);
        const [eHour, eMin] = endTime.split(":").map(Number);
        const totalHours = Math.max(1, (eHour * 60 + eMin - (sHour * 60 + sMin)) / 60);
        const hourlyRate = studio.hourlyRate;
        const subtotal = Math.round(hourlyRate * totalHours);
        const securityDeposit = studio.securityDeposit || 0;
        const serviceFee = Math.round(subtotal * 0.08); // 8% platform fee
        const totalAmount = subtotal + securityDeposit + serviceFee;
        const newBooking = {
            studioId: studio._id.toString(),
            studioTitle: studio.title,
            studioImage: studio.image,
            renterEmail: user.email,
            renterName: user.name,
            ownerEmail: studio.ownerEmail,
            bookingDate,
            startTime,
            endTime,
            totalHours,
            hourlyRate,
            subtotal,
            securityDeposit,
            serviceFee,
            totalAmount,
            status: "Pending", // Default reservation state
            notes: notes?.trim() || "",
            createdAt: new Date(),
        };
        if (isDbConnected() && getDB()) {
            const db = getDB();
            const result = await db.collection("bookings").insertOne(newBooking);
            res.status(201).json({
                success: true,
                message: "Studio booking request submitted successfully! Status: Pending host review.",
                booking: { ...newBooking, _id: result.insertedId.toString() },
            });
            return;
        }
        const id = `booking_${Date.now()}`;
        const saved = { ...newBooking, _id: id };
        inMemoryStore.bookings.unshift(saved);
        res.status(201).json({
            success: true,
            message: "Studio booking request submitted successfully! Status: Pending host review.",
            booking: saved,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to process studio booking." });
    }
}
export async function getMyBookings(req, res) {
    try {
        const user = req.user;
        if (isDbConnected() && getDB()) {
            const db = getDB();
            const bookings = await db
                .collection("bookings")
                .find({ renterEmail: user.email })
                .sort({ createdAt: -1 })
                .toArray();
            res.status(200).json({
                success: true,
                count: bookings.length,
                bookings: bookings.map(b => ({ ...b, _id: b._id.toString() })),
            });
            return;
        }
        const userBookings = inMemoryStore.bookings.filter(b => b.renterEmail === user.email);
        res.status(200).json({
            success: true,
            count: userBookings.length,
            bookings: userBookings,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch bookings." });
    }
}
export async function cancelBooking(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        if (isDbConnected() && getDB()) {
            const db = getDB();
            let query = {};
            if (ObjectId.isValid(id)) {
                query = { _id: new ObjectId(id) };
            }
            else {
                query = { _id: id };
            }
            const booking = await db.collection("bookings").findOne(query);
            if (!booking) {
                res.status(404).json({ success: false, message: "Booking record not found." });
                return;
            }
            if (booking.renterEmail !== user.email && user.role !== "admin") {
                res.status(403).json({ success: false, message: "Forbidden: You cannot cancel another creator's reservation." });
                return;
            }
            if (booking.status !== "Pending") {
                res.status(400).json({
                    success: false,
                    message: `Only 'Pending' reservations can be cancelled directly. Current status: ${booking.status}.`,
                });
                return;
            }
            await db.collection("bookings").updateOne(query, { $set: { status: "Cancelled", updatedAt: new Date() } });
            res.status(200).json({
                success: true,
                message: "Studio booking has been successfully cancelled.",
            });
            return;
        }
        const booking = inMemoryStore.bookings.find(b => b._id.toString() === id);
        if (!booking) {
            res.status(404).json({ success: false, message: "Booking record not found." });
            return;
        }
        if (booking.renterEmail !== user.email && user.role !== "admin") {
            res.status(403).json({ success: false, message: "Forbidden: You cannot cancel another creator's reservation." });
            return;
        }
        if (booking.status !== "Pending") {
            res.status(400).json({
                success: false,
                message: `Only 'Pending' reservations can be cancelled directly. Current status: ${booking.status}.`,
            });
            return;
        }
        booking.status = "Cancelled";
        booking.updatedAt = new Date();
        res.status(200).json({
            success: true,
            message: "Studio booking has been successfully cancelled.",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to cancel booking." });
    }
}
export async function getStudioBookings(req, res) {
    try {
        const { studioId } = req.params;
        if (isDbConnected() && getDB()) {
            const db = getDB();
            let studioQueryId = studioId;
            if (ObjectId.isValid(studioId)) {
                studioQueryId = new ObjectId(studioId);
            }
            const bookings = await db
                .collection("bookings")
                .find({
                $or: [{ studioId: studioQueryId }, { studioId: studioId }],
                status: { $in: ["Pending", "Confirmed"] },
            })
                .project({ bookingDate: 1, startTime: 1, endTime: 1, status: 1 })
                .toArray();
            res.status(200).json({
                success: true,
                bookings: bookings.map(b => ({ ...b, _id: b._id.toString() })),
            });
            return;
        }
        const bookings = inMemoryStore.bookings
            .filter(b => b.studioId.toString() === studioId && (b.status === "Pending" || b.status === "Confirmed"))
            .map(b => ({
            _id: b._id,
            bookingDate: b.bookingDate,
            startTime: b.startTime,
            endTime: b.endTime,
            status: b.status,
        }));
        res.status(200).json({
            success: true,
            bookings,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch studio bookings." });
    }
}
