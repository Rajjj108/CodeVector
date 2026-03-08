import express from "express";
import AIAnalysis from "../models/AIAnalysis.js";
import Submission from "../models/Submission.js";
import { analyzeCode } from "../utils/gemini.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/analyze", protect, async (req, res) => {
  try {
    const { problemId, submissionId } = req.body;

    // req.user is a full Mongoose User document — use ._id
    const userId = req.user._id;

    if (!submissionId) {
      return res.status(400).json({ message: "submissionId is required" });
    }

    // 1️⃣ Check cached analysis
    const existing = await AIAnalysis.findOne({ submissionId });
    if (existing) {
      console.log("[AI] Returning cached analysis for", submissionId);
      return res.json(existing);
    }

    // 2️⃣ Get submission
    console.log("[AI] Looking up submission:", submissionId);
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      console.error("[AI] Submission not found:", submissionId);
      return res.status(404).json({ message: "Submission not found" });
    }

    // 3️⃣ Build prompt — explicit JSON-only instruction, no markdown
    const prompt = `You are a senior software engineer and coding interviewer.
Analyze the following programming solution and respond with ONLY a raw JSON object — no markdown, no code fences, no explanation.

Problem ID: ${problemId}
Language: ${submission.language}

Code:
${submission.code}

Respond with ONLY this JSON (fill in all fields):
{"timeComplexity":"","spaceComplexity":"","improvements":[],"alternativeApproach":"","codeQuality":[],"edgeCases":[],"interviewExplanation":""}`;

    // 4️⃣ Call Gemini
    console.log("[AI] Calling Gemini for submission:", submissionId);
    const text = await analyzeCode(prompt);
    console.log("[AI] Gemini raw response (first 200 chars):", text.slice(0, 200));

    // Robustly extract the first valid JSON object from the response
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("[AI] No JSON found in Gemini response:", text);
      throw new Error("Gemini returned no JSON object");
    }
    const analysis = JSON.parse(match[0]);

    // 5️⃣ Store
    const saved = await AIAnalysis.create({
      userId,
      problemId,
      submissionId,
      language: submission.language,
      ...analysis
    });

    console.log("[AI] Analysis saved:", saved._id);
    res.json(saved);

  } catch (err) {
    console.error("[AI] Analysis Error:", err.message || err);
    res.status(500).json({ message: err.message || "AI analysis failed" });
  }
});

export default router;
