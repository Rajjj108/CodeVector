import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  getTotalCodingTime,
  getAvgTimeByDifficulty,
  getFastestSolve,
  getHeatmap,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/total-time", protect, getTotalCodingTime);
router.get("/avg-difficulty", protect, getAvgTimeByDifficulty);
router.get("/fastest", protect, getFastestSolve);
router.get("/heatmap", protect, getHeatmap);

export default router;