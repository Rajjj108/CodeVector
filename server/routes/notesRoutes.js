import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getNotes, saveNote, deleteNote } from "../controllers/notesController.js";

const router = express.Router();

// GET  /api/notes/:problemId  — fetch all notes for a problem
router.get("/:problemId",  protect, getNotes);

// POST /api/notes/:problemId  — create or update a note
router.post("/:problemId", protect, saveNote);

// DELETE /api/notes/:noteId   — delete a specific note
router.delete("/:noteId",  protect, deleteNote);

export default router;
