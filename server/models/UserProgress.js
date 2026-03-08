import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemId: {
      type: String,   // LC_xx string IDs, not Mongo ObjectIds
      required: true,
    },

    status: {
      type: String,
      // DSA Tracker values: "Solved" | "Revision" | "Pending"
      default: "Pending",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },

    topic: String,

    solvedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One record per user per problem
progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.model("UserProgress", progressSchema);
