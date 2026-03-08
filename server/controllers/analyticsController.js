import Submission from "../models/Submission.js";
import Heatmap from "../models/Heatmap.js";

/* ================= TOTAL CODING TIME ================= */
export const getTotalCodingTime = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Submission.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalTime: { $sum: "$timeTaken" },
        },
      },
    ]);

    res.json({
      totalSeconds: result[0]?.totalTime || 0,
    });

  } catch (error) {
    console.error("Total Time Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= AVG TIME BY DIFFICULTY ================= */
export const getAvgTimeByDifficulty = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await Submission.aggregate([
      { $match: { userId, verdict: "Accepted" } },

      {
        $lookup: {
          from: "problems",
          localField: "problemId",
          foreignField: "_id",
          as: "problem",
        },
      },

      { $unwind: "$problem" },

      {
        $group: {
          _id: "$problem.difficulty",
          avgTime: { $avg: "$timeTaken" },
        },
      },
    ]);

    res.json(data);

  } catch (error) {
    console.error("Avg Difficulty Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= FASTEST SOLVE ================= */
export const getFastestSolve = async (req, res) => {
  try {
    const userId = req.user._id;

    const fastest = await Submission.findOne({
      userId,
      verdict: "Accepted",
    })
      .sort({ timeTaken: 1 })
      .populate("problemId", "title difficulty");

    res.json(fastest || {});

  } catch (error) {
    console.error("Fastest Solve Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= HEATMAP ================= */
export const getHeatmap = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all accepted submissions
    const subs = await Submission.find({ userId, status: "Accepted" })
      .sort({ updatedAt: 1 })
      .lean();

    // Group by YYYY-MM-DD
    const heatmapMap = {};
    for (const sub of subs) {
      const d = new Date(sub.updatedAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${day}`;
      heatmapMap[key] = (heatmapMap[key] || 0) + 1;
    }

    // Convert to array format expected by frontend [{ date, count }]
    const heatmap = Object.entries(heatmapMap).map(([date, count]) => ({
      date,
      count
    }));

    res.json(heatmap);

  } catch (error) {
    console.error("Heatmap Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};