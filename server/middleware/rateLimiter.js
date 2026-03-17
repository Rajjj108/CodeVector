import rateLimit from "express-rate-limit";

/**
 * loginLimiter — strict: 10 attempts per 15 minutes per IP.
 * Applied only to /auth/login and /auth/google.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * signupLimiter — relaxed: 20 signups per hour per IP.
 */
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many accounts created from this IP. Please try again after an hour.",
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
