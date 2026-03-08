import express from "express";
import mongoose from "mongoose";
import Problem from "../models/Problem.js";

const router = express.Router();
const testcaseSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
});

router.get("/", async (req, res) => {
  const problems = await Problem.find();
  res.json(problems);
});
router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;