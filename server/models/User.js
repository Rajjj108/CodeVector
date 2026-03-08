import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
    },

    googleId: String,
    avatar: String,

    /* ===== STREAK ===== */
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastSolvedDate: Date,
      restoreWindow: { type: Boolean, default: false },
      restoreExpiry: Date,
    },

    /* ===== SOLVE STATS ===== */
    totalSolved: {
      type: Number,
      default: 0,
    },

    solvedByDifficulty: {
      easy:   { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard:   { type: Number, default: 0 },
    },

    progress: {
      type: Number,
      default: 0,
    },

    plan: {
      type: String,
      default: "Free",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
