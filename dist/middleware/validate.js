"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingSchema = exports.studioSchema = exports.googleAuthSchema = exports.loginSchema = exports.registerSchema = void 0;
exports.validateBody = validateBody;
const zod_1 = require("zod");
/**
 * Higher-order middleware factory to validate incoming request bodies against a Zod schema.
 * Rejects invalid payloads with clean 400 Bad Request error messages before hitting controller logic.
 */
function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const issues = error.errors.map(err => ({
                    field: err.path.join("."),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: issues[0]?.message || "Invalid request payload format.",
                    errors: issues,
                });
                return;
            }
            next(error);
        }
    };
}
// ==================== ZOD SCHEMAS ====================
// 1. User Registration Schema
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: "Full name is required." })
        .trim()
        .min(2, "Full name must be at least 2 characters.")
        .max(80, "Full name cannot exceed 80 characters."),
    email: zod_1.z
        .string({ required_error: "Email address is required." })
        .trim()
        .email("Please provide a valid email address.")
        .toLowerCase(),
    password: zod_1.z
        .string({ required_error: "Password is required." })
        .min(6, "Password must be at least 6 characters.")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter."),
    photoURL: zod_1.z.string().trim().url("Photo URL must be a valid web address.").optional().or(zod_1.z.literal("")),
});
// 2. User Login Schema
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: "Email address is required." })
        .trim()
        .email("Please provide a valid email address.")
        .toLowerCase(),
    password: zod_1.z
        .string({ required_error: "Password is required." })
        .min(1, "Password cannot be empty."),
});
// 3. Google Single Sign-On Schema
exports.googleAuthSchema = zod_1.z.object({
    name: zod_1.z.string().trim().max(80).optional(),
    email: zod_1.z
        .string({ required_error: "Email is required for Google authentication." })
        .trim()
        .email("Invalid Google account email.")
        .toLowerCase(),
    photoURL: zod_1.z.string().trim().optional(),
});
// 4. Studio Creation & Listing Schema
exports.studioSchema = zod_1.z.object({
    title: zod_1.z
        .string({ required_error: "Studio title is required." })
        .trim()
        .min(3, "Studio title must be at least 3 characters.")
        .max(120, "Studio title cannot exceed 120 characters."),
    category: zod_1.z.enum(["Photo Studio", "Film Stage", "Podcast Lounge", "Music Suite", "Art Workshop"], { required_error: "Please select a valid studio category." }),
    hourlyRate: zod_1.z.coerce
        .number({ required_error: "Hourly rate is required." })
        .positive("Hourly rate must be greater than zero.")
        .max(25000, "Hourly rate cannot exceed $25,000/hr."),
    securityDeposit: zod_1.z.coerce
        .number()
        .min(0, "Security deposit cannot be negative.")
        .default(0),
    maxCapacity: zod_1.z.coerce
        .number()
        .int("Capacity must be a whole number.")
        .min(1, "Capacity must be at least 1 person.")
        .max(500, "Capacity cannot exceed 500 people.")
        .default(10),
    location: zod_1.z
        .string({ required_error: "Location is required." })
        .trim()
        .min(3, "Location must be at least 3 characters.")
        .max(200, "Location cannot exceed 200 characters."),
    image: zod_1.z
        .string({ required_error: "Featured image URL is required." })
        .trim()
        .url("Featured image must be a valid URL."),
    gallery: zod_1.z
        .array(zod_1.z.string().trim().url("Gallery images must be valid URLs."))
        .optional()
        .default([]),
    amenities: zod_1.z
        .union([zod_1.z.array(zod_1.z.string()), zod_1.z.string()])
        .optional()
        .transform((val) => {
        if (Array.isArray(val))
            return val;
        if (typeof val === "string")
            return val.split(",").map((s) => s.trim()).filter(Boolean);
        return [];
    }),
    overview: zod_1.z
        .string()
        .trim()
        .max(3000, "Overview cannot exceed 3,000 characters.")
        .optional(),
});
// 5. Booking Reservation Schema
exports.bookingSchema = zod_1.z.object({
    studioId: zod_1.z.string({ required_error: "Studio ID is required." }).min(1, "Studio ID cannot be empty."),
    bookingDate: zod_1.z
        .string({ required_error: "Booking date is required." })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Booking date must be in YYYY-MM-DD format."),
    startTime: zod_1.z
        .string({ required_error: "Start time is required." })
        .regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format."),
    endTime: zod_1.z
        .string({ required_error: "End time is required." })
        .regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format."),
    notes: zod_1.z.string().trim().max(1000, "Notes cannot exceed 1,000 characters.").optional(),
});
