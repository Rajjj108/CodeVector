// server/routes/progress.js
import express from "express";
import UserProgress from "../models/UserProgress.js";
import User         from "../models/User.js";
import protect      from "../middleware/authMiddleware.js";
import fs           from "fs";
import path         from "path";

const QUESTIONS_PATH = path.join(
  process.cwd().replace(/"/g, ""),
  "server", "data", "question-bank", "formatted", "questions.json"
);

let _questions = null;
const getQuestions = () => {
  if (!_questions) _questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));
  return _questions;
};

const router = express.Router();

// Update status (from DSA tracker's solve/revision toggle)
router.post("/update", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId, status } = req.body;

    // We need problem details to know the difficulty and topic
    const questions = getQuestions();
    const problem   = questions.find(q => q.id === problemId);
    const difficulty = problem ? (problem.difficulty || "").toLowerCase() : "medium";
    const topic      = problem ? (problem.topic || problem.topics?.[0] || "") : "";

    const oldDoc = await UserProgress.findOneAndUpdate(
      { userId, problemId },
      { $set: { status, difficulty, topic }, $setOnInsert: { solvedAt: new Date() } },
      { upsert: true, setDefaultsOnInsert: true, new: false } // returns old doc (or null if new)
    );

    const oldStatus = oldDoc ? oldDoc.status : null;
    const isNowSolved = status === "Solved" || status === "solved";
    const wasSolved   = oldStatus === "Solved" || oldStatus === "solved";

    // Reconcile user stats if the "solve" state changed
    if (isNowSolved && !wasSolved) {
      // +1 to stats
      const incPayload = { totalSolved: 1 };
      if (["easy", "medium", "hard"].includes(difficulty)) {
        incPayload[`solvedByDifficulty.${difficulty}`] = 1;
      }
      await User.updateOne({ _id: userId }, { $inc: incPayload });
    } else if (!isNowSolved && wasSolved) {
      // -1 to stats
      const incPayload = { totalSolved: -1 };
      if (["easy", "medium", "hard"].includes(difficulty)) {
        incPayload[`solvedByDifficulty.${difficulty}`] = -1;
      }
      await User.updateOne({ _id: userId }, { $inc: incPayload });
    }

    res.json({ success: true, isNowSolved, wasSolved });
  } catch (error) {
    console.error("Progress update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Lightweight: return only solved problem IDs (e.g. ["CV_1", "CV_42"])
// Used by DsaTracker to mark question rows without heavy payload
router.get("/solved-ids", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const records = await UserProgress.find(
      { userId, status: { $in: ["Solved", "solved"] } },
      { problemId: 1, status: 1, _id: 0 }
    ).lean();
    // Return map { "CV_1": "Solved", "CV_42": "Revision" }
    const map = {};
    for (const r of records) map[r.problemId] = r.status;
    res.json(map);
  } catch (error) {
    console.error("Solved IDs fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Full progress map — all statuses (Solved, Revision, Pending)
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const records = await UserProgress.find({ userId }, { problemId: 1, status: 1, _id: 0 }).lean();
    const map = {};
    for (const r of records) map[r.problemId] = r.status;
    res.json(map);
  } catch (error) {
    console.error("Progress fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
