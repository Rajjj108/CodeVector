import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import BlacklistedToken from "../models/BlacklistedToken.js";

const protect = async (req, res, next) => {
  try {
    let token = null;

    /* ================= TOKEN EXTRACTION ================= */

    // 1️⃣ From Cookies (Primary)
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2️⃣ From Authorization Header (Fallback)
    else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    /* ================= TOKEN EXISTENCE CHECK ================= */

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    /* ================= MALFORMED TOKEN GUARD ================= */

    if (typeof token !== "string" || token.split(".").length !== 3) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    /* ================= VERIFY TOKEN ================= */

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT Verify Error:", err.message);

      return res.status(401).json({
        success: false,
        message: "Token invalid or expired",
      });
    }

    /* ================= TOKEN STRUCTURE CHECK ================= */

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Token payload invalid",
      });
    }

    /* ================= BLACKLIST CHECK ================= */

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const blacklisted = await BlacklistedToken.findOne({ tokenHash });

    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: "Session has been invalidated. Please log in again.",
      });
    }

    /* ================= USER EXISTENCE CHECK ================= */

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    /* ================= ATTACH TOKEN & USER ================= */

    // Store raw token on req so logoutUser can blacklist it
    req.token = token;
    req.user = user;

    next();

  } catch (error) {
    console.error("Auth Middleware Fatal Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

export default protect;