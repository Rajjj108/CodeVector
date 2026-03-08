import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemId: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, problemId: 1 });

export default mongoose.model("Note", noteSchema);
