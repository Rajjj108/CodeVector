import Submission   from "../models/Submission.js";
import UserProgress from "../models/UserProgress.js";
import User         from "../models/User.js";
import { runOneCase, judgeEqual, isValidTestCase } from "./codeController.js";
import fs   from "fs";
import path from "path";

const QUESTIONS_PATH = path.join(
  process.cwd().replace(/"/g, ""),
  "server", "data", "question-bank", "formatted", "questions.json"
);

let _questions = null;
const getQuestions = () => {
  if (!_questions) _questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));
  return _questions;
};

/* ─── Today's date string "YYYY-MM-DD" ─── */
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* ═══════════════════════════════════════════════════════
   POST /api/submission/submit
   Full pipeline: judge → save → progress → stats → heatmap → streak
═══════════════════════════════════════════════════════ */
export const submitCode = async (req, res) => {
  try {
    const { problemId, code, language, timeTaken, activeTime, whiteboardData } = req.body;
    const userId = req.user._id;

    /* ── 1. Load problem ── */
    const problems = getQuestions();
    const problem  = problems.find(p => p.id === problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const difficulty = (problem.difficulty || "").toLowerCase(); // "easy" | "medium" | "hard"
    const topic      = problem.topic || problem.topics?.[0] || "";

    /* ── 2. Merge visible + hidden test cases ── */
    const allCases = [
      ...(problem.testCases       || []).filter(isValidTestCase),
      ...(problem.hiddenTestCases || []).filter(isValidTestCase),
    ];

    if (allCases.length === 0) {
      return res.status(400).json({ message: "No test cases available" });
    }

    /* ── 3. Run each test case ── */
    let passed = 0;
    const start = Date.now();
    for (const tc of allCases) {
      try {
        const result = await runOneCase(code, language, tc.input);
        const actual = (result.output || "").trim();
        if (!result.error && judgeEqual(actual, tc.output || "")) passed++;
      } catch (_) { /* counts as fail */ }
    }
    const runtime = Date.now() - start; // total judge time in ms

    const verdict = passed === allCases.length ? "Accepted" : "Wrong Answer";

    /* ── 4. If Accepted → persist everything ── */
    let submissionId = null;
    if (verdict === "Accepted") {

      /* 4a. Save / update the submission */
      const savedSub = await Submission.findOneAndUpdate(
        { userId, problemId },
        { $set: { code, language, status: "Accepted", runtime, timeTaken, activeTime, whiteboardData } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      submissionId = savedSub._id;

      /* 4b. Upsert UserProgress — track if this is a FIRST solve */
      const progressResult = await UserProgress.findOneAndUpdate(
        { userId, problemId },
        {
          $set:         { status: "Solved", difficulty, topic, solvedAt: new Date() },
          $setOnInsert: { userId, problemId },
        },
        { upsert: true, new: false } // `new: false` returns OLD doc — null means it was just created
      );

      const isFirstSolve = progressResult === null ||
                           (progressResult.status !== "Solved" && progressResult.status !== "solved");

      /* 4c. Update user stats ONLY on first solve */
      if (isFirstSolve) {
        const incPayload = { totalSolved: 1 };
        if (["easy", "medium", "hard"].includes(difficulty)) {
          incPayload[`solvedByDifficulty.${difficulty}`] = 1;
        }
        await User.updateOne({ _id: userId }, { $inc: incPayload });
      } // end isFirstSolve

    } // end verdict === "Accepted"

    /* ── 5. Respond ── */
    res.json({ verdict, passed, total: allCases.length, runtime, submissionId });

  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/submission/solutions
   Returns all accepted submissions for the logged-in user,
   enriched with problem metadata.
═══════════════════════════════════════════════════════ */
export const getSolutions = async (req, res) => {
  try {
    const userId = req.user._id;

    const submissions = await Submission.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    const questions = getQuestions();
    const enriched = submissions.map(s => {
      const q = questions.find(p => p.id === s.problemId);
      return {
        id:         s._id,
        problemId:  s.problemId,
        title:      q?.title       || s.problemId,
        difficulty: q?.difficulty  || "Unknown",
        topic:      q?.topic       || q?.topics?.[0] || "",
        code:       s.code,
        language:   s.language,
        runtime:    s.runtime,
        solvedAt:   s.updatedAt,
        timeTaken:  s.timeTaken,
        whiteboardData: s.whiteboardData,
      };
    });

    res.json({ solutions: enriched });
  } catch (error) {
    console.error("getSolutions error:", error);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};
