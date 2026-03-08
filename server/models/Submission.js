import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
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

    language: String,
    code:     { type: String },

    status: {
      type: String,
      enum: ["Accepted"],
      default: "Accepted",
    },

    runtime:  Number,  // milliseconds
    memory:   Number,  // KB

    timeTaken:     Number,  // total time (seconds)
    activeTime:    Number,  // active editor time (seconds)
    whiteboardData: Object, // stores drawing strokes as JSON
  },
  { timestamps: true }
);

// One accepted submission per user per problem (upsert on re-solve)
submissionSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);
