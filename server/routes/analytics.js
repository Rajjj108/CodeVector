// server/routes/analytics.js
import express from "express";
import protect from "../middleware/authMiddleware.js";
import Submission from "../models/Submission.js";

const router = express.Router();

router.get("/submissions", protect, async (req, res) => {
  const userId = req.user.id;

  const subs = await Submission.find({ userId });

  res.json(subs);
});

export default router;