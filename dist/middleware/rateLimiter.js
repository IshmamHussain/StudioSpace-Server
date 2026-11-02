import rateLimit from "express-rate-limit";
const createRateLimiter = (options) => {
    const limiterFn = typeof rateLimit === "function"
        ? rateLimit
        : rateLimit?.default || rateLimit?.rateLimit;
    if (typeof limiterFn === "function") {
        return limiterFn(options);
    }
    return (_req, _res, next) => next();
};
// General API Rate Limiter
export const generalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per 15 minutes
    standardHeaders: true, // Return standard RateLimit-* headers
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again after 15 minutes.",
    },
});
// Authentication Rate Limiter (Protects against brute force and credential stuffing)
export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 25, // Limit each IP to 25 auth attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts from this IP. Please try again in 15 minutes.",
    },
});
// Mutation Rate Limiter (Protects against automated spam bookings and listings)
export const mutationLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 45, // Limit each IP to 45 mutations per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Request quota reached for mutations. Please try again in a few minutes.",
    },
});
