import crypto from "crypto";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import BlacklistedToken from "../models/BlacklistedToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../utils/sendEmail.js";

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

/* ================= OTP LOGIC ================= */

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists with this email" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Save to database (upsert to overwrite previous unverified OTP)
    await OTP.findOneAndUpdate(
      { email },
      { 
        otp: hashedOtp, 
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
        attempts: 0,
        verified: false
      },
      { upsert: true, new: true }
    );

    // Send email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">Your Verification Code</h2>
        <p style="color: #333; font-size: 16px;">Please use the following OTP to complete your registration. This code will expire in 5 minutes.</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; margin: 0; color: #333;">${otp}</h1>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: "CodeVector Verification Code",
      html: emailHtml
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

/* ================= REGISTER ================= */

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Verify OTP first
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord || !otpRecord.verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified. Please verify OTP first.",
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

    // Delete OTP record after successful registration to clean up
    await OTP.deleteOne({ email });

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