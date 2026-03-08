import mongoose from "mongoose";

const heatmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: {
    type: String,   // "YYYY-MM-DD"
    required: true,
  },

  count: {
    type: Number,
    default: 0,
  },
});

heatmapSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Heatmap", heatmapSchema);
