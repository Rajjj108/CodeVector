import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  getDashboardSummary,
  getTodaysFocus,
  getDsaData,
  getInterviewData,
  getTestsData,
  getActivityData,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary",     protect, getDashboardSummary);
router.get("/focus",       protect, getTodaysFocus);
router.get("/dsa",         protect, getDsaData);
router.get("/interview",   protect, getInterviewData);
router.get("/tests",       protect, getTestsData);
router.get("/activity",    protect, getActivityData);

export default router;