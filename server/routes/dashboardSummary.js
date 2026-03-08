import express from "express";
import protect from "../middleware/authMiddleware.js";
import UserProgress from "../models/UserProgress.js";

const router = express.Router();

router.get("/summary", protect, async (req, res) => {
  const userId = req.user.id;

  const progress = await UserProgress.find({ userId });

  const solved = progress.filter(p => p.status === "Solved").length;
  const revision = progress.filter(p => p.status === "Revision").length;
  const total = progress.length;

  const completion =
    total === 0 ? 0 : Math.round((solved / total) * 100);

  res.json({ total, solved, revision, completion });
});

export default router;