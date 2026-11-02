export function notFoundHandler(req, res, _next) {
    res.status(404).json({
        success: false,
        message: `API Route not found: [${req.method}] ${req.originalUrl}`,
    });
}
export function globalErrorHandler(err, req, res, _next) {
    console.error("Unhandled Error caught in global middleware:", err);
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal server error. Please try again later.";
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
}
