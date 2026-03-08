import express from "express";
import protect from "../middleware/authMiddleware.js";
import { submitCode, getSolutions } from "../controllers/submissionController.js";

const router = express.Router();

router.post("/submit",   protect, submitCode);
router.get("/solutions", protect, getSolutions);  // locked auto-saved solutions log

export default router;