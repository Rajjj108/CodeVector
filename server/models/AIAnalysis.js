import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission"
  },
  language: String,
  timeComplexity: String,
  spaceComplexity: String,
  improvements: [String],
  alternativeApproach: String,
  codeQuality: [String],
  edgeCases: [String],
  interviewExplanation: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("AIAnalysis", aiAnalysisSchema);
