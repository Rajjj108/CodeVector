import Note from "../models/Note.js";

/* ═══════════════════════════════════════════════
   GET /api/notes/:problemId
   Returns notes for the authenticated user + problem.
═══════════════════════════════════════════════ */
export const getNotes = async (req, res) => {
  try {
    const userId    = req.user._id;
    const { problemId } = req.params;

    const notes = await Note.find({ userId, problemId }).sort({ createdAt: -1 }).lean();
    res.json({ notes });
  } catch (error) {
    console.error("getNotes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ═══════════════════════════════════════════════
   POST /api/notes/:problemId
   Creates or updates a note for the user + problem.
═══════════════════════════════════════════════ */
export const saveNote = async (req, res) => {
  try {
    const userId    = req.user._id;
    const { problemId } = req.params;
    const { content, noteId } = req.body;

    let note;
    if (noteId) {
      // Update an existing note
      note = await Note.findOneAndUpdate(
        { _id: noteId, userId },
        { $set: { content } },
        { new: true }
      );
      if (!note) return res.status(404).json({ message: "Note not found" });
    } else {
      // Create a new note
      note = await Note.create({ userId, problemId, content });
    }

    res.json({ note });
  } catch (error) {
    console.error("saveNote error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ═══════════════════════════════════════════════
   DELETE /api/notes/:noteId
   Deletes a specific note (must belong to the user).
═══════════════════════════════════════════════ */
export const deleteNote = async (req, res) => {
  try {
    const userId  = req.user._id;
    const { noteId } = req.params;

    const result = await Note.deleteOne({ _id: noteId, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Note not found or unauthorized" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("deleteNote error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
