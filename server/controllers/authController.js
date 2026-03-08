import crypto from "crypto";
import User from "../models/User.js";
import BlacklistedToken from "../models/BlacklistedToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Reusable cookie options for consistency across logins
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // securely adapts to dev/prod
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/** Helper: sign a JWT with a unique jti for blacklisting support */
const signToken = (userId) => {
  return jwt.sign(
    { id: userId, jti: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ================= GET CURRENT USER ================= */

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/* ================= GOOGLE LOGIN ================= */

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
      });
    }

    const appToken = signToken(user._id);

    res.cookie("token", appToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ success: false, message: "Google authentication failed" });
  }
};

/* ================= SIGNUP ================= */

export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= LOGIN ================= */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = signToken(user._id);

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= LOGOUT ================= */

export const logoutUser = async (req, res) => {
  try {
    // req.token is attached by authMiddleware
    const rawToken = req.token;

    if (rawToken) {
      // Decode to get expiry for TTL matching
      const decoded = jwt.decode(rawToken);
      const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Hash the token before storing (never store raw tokens)
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      // Upsert so duplicate logout calls don't throw
      await BlacklistedToken.updateOne(
        { tokenHash },
        { tokenHash, expiresAt },
        { upsert: true }
      );
    }

    // Clear the cookie regardless
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });

  } catch (error) {
    console.error("Logout Error:", error);
    // Even if blacklisting fails, clear the cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ success: true, message: "Logged out" });
  }
};

export const getTestsData = async (req, res) => {
  try {
    const userId = req.user._id;

    const tests = await UserProgress.find({
      userId,
      type: "mock",
    }).select("score createdAt");

    res.status(200).json(tests);

  } catch (error) {
    console.error("Tests Data Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};