import express from "express";
import {
  registerUser,
  sendOtp,
  verifyOtp,
  loginUser,
  googleLogin,
  getCurrentUser,
  logoutUser,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { loginLimiter, signupLimiter, otpReqLimiter, otpVerifyLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/* ========= PUBLIC ROUTES ========= */

router.post("/send-otp", otpReqLimiter, sendOtp);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.post("/register", signupLimiter, registerUser);

router.post("/login",  loginLimiter,  loginUser);
router.post("/google", loginLimiter,  googleLogin);

/* ========= PROTECTED ROUTES ========= */

// Logout requires a valid session (so we can blacklist the token)
router.post("/logout", protect, logoutUser);

// Get current authenticated user (used by AuthContext on page load)
router.get("/me", protect, getCurrentUser);

export default router;