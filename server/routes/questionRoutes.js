import express from "express";
import { getQuestions, getQuestionById } from "../controllers/questionController.js";

const router = express.Router();

/* GET PAGINATED QUESTIONS (with topic + difficulty filtering) */
router.get("/", getQuestions);

/* GET SINGLE QUESTION */
router.get("/:id", getQuestionById);

export default router;