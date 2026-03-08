import User         from "../models/User.js";
import UserProgress from "../models/UserProgress.js";
import Heatmap      from "../models/Heatmap.js";
import Submission   from "../models/Submission.js";
import fs           from "fs";
import path         from "path";

/* ─── helpers ─── */
const QUESTIONS_PATH = path.join(
  process.cwd().replace(/"/g, ""),
  "server", "data", "question-bank", "formatted", "questions.json"
);

let _questions = null;
const getQuestions = () => {
  if (!_questions) _questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));
  return _questions;
};

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* ================= SUMMARY ================= */
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "name email createdAt totalSolved solvedByDifficulty progress plan avatar"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Fetch ALL accepted submissions to derive streak and activity dynamically
    const subs = await Submission.find({ userId, status: "Accepted" })
      .sort({ updatedAt: 1 })
      .lean()
      .catch(() => []); // If Submission model isn't imported, we'll need to fix that, but dashboardController.js already imports Submission from the recalc fix

    // 2. Build heatmap map
    const heatmapMap = {};
    for (const sub of subs) {
      const d = new Date(sub.updatedAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${day}`;
      heatmapMap[key] = (heatmapMap[key] || 0) + 1;
    }

    const activeDays = Object.keys(heatmapMap).length;
    
    const todayStrFn = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const todayStr = todayStrFn();
    const solvedToday = heatmapMap[todayStr] || 0;

    // 3. Compute Streak dynamically
    const sortedDates = Object.keys(heatmapMap).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let streakRun = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          streakRun++;
        } else {
          if (streakRun > longestStreak) longestStreak = streakRun;
          streakRun = 1;
        }
    }
    if (streakRun > longestStreak) longestStreak = streakRun;

    const yesterdayD = new Date();
    yesterdayD.setDate(yesterdayD.getDate() - 1);
    const yesterdayStr = `${yesterdayD.getFullYear()}-${String(yesterdayD.getMonth() + 1).padStart(2, "0")}-${String(yesterdayD.getDate()).padStart(2, "0")}`;

    const lastKey = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
    if (lastKey === todayStr || lastKey === yesterdayStr) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const curr = new Date(sortedDates[i + 1]);
        const prev = new Date(sortedDates[i]);
        const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diff === 1) currentStreak++;
        else break;
      }
    } else {
      currentStreak = 0; 
    }

    /* Calculate true accuracy based on submissions */
    const totalSubmissions = await UserProgress.countDocuments({ userId, type: { $ne: "interview" }, status: { $ne: "incomplete" } });
    const acceptedSubmissions = await UserProgress.countDocuments({ userId, status: { $in: ["Solved", "solved"] } });
    const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    const sbd = user.solvedByDifficulty || {};

    res.status(200).json({
      name:        user.name,
      email:       user.email,
      avatar:      user.avatar,
      // Pass the computed streak!
      streak:      { current: currentStreak, longest: longestStreak },
      totalSolved: user.totalSolved,
      totalProblems: 2913,
      solvedToday,
      activeDays,
      accuracy,
      easy:   { solved: sbd.easy   ?? 0, total: 869  },
      medium: { solved: sbd.medium ?? 0, total: 1829 },
      hard:   { solved: sbd.hard   ?? 0, total: 815  },
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= TODAY'S FOCUS ================= */
export const getTodaysFocus = async (req, res) => {
  try {
    const userId = req.user._id;
    const questions = getQuestions();

    /* Find a recently incomplete problem to deduce topic */
    const lastIncomplete = await UserProgress
      .findOne({ userId, status: { $in: ["incomplete", "Pending", "Revision"] } })
      .sort({ updatedAt: -1 })
      .lean();

    const lastTopic = lastIncomplete?.topic || "Arrays";

    /* Get all solved problem IDs */
    const solvedRecords = await UserProgress.find({ userId, status: { $in: ["solved", "Solved"] } }).lean();
    const solvedIds = new Set(solvedRecords.map(r => r.problemId));

    /* Pick 3 unsolved problems from questions.json, preferably from lastTopic */
    let recommended = questions
      .filter(q => !solvedIds.has(q.id) && (q.topic === lastTopic || q.topics?.includes(lastTopic)))
      .slice(0, 3);

    // fallback if not enough in topic
    if (recommended.length < 3) {
      const more = questions.filter(q => !solvedIds.has(q.id) && !recommended.find(r => r.id === q.id));
      recommended.push(...more.slice(0, 3 - recommended.length));
    }

    res.status(200).json({
      topic: lastTopic,
      lastTopic,
      problems: recommended.map(q => ({
        _id: q.id,  // UI expects _id
        title: q.title,
        topic: q.topic || q.topics?.[0] || "",
        difficulty: q.difficulty || "medium",
        frontendId: q.id
      })),
    });

  } catch (error) {
    console.error("Today's Focus Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= DSA PROGRESS ================= */
export const getDsaData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get all problems the user has solved (status = Solved / solved)
    const solvedRecords = await UserProgress.find({
      userId,
      status: { $in: ["Solved", "solved"] },
    }).lean();

    if (!solvedRecords.length) return res.json([]);

    // 2. Group solved records by topic + difficulty
    const solvedByTopic = {};
    for (const rec of solvedRecords) {
      const t = rec.topic || "Other";
      const d = (rec.difficulty || "medium").toLowerCase();
      
      if (!solvedByTopic[t]) solvedByTopic[t] = { easy: 0, medium: 0, hard: 0 };
      if (d === "easy")        solvedByTopic[t].easy++;
      else if (d === "hard")   solvedByTopic[t].hard++;
      else                     solvedByTopic[t].medium++;
    }

    // 3. Get total counts per topic from questions.json
    const questions = getQuestions();
    const totalMap = {};
    for (const q of questions) {
      const t = q.topic || q.topics?.[0] || "Other";
      totalMap[t] = (totalMap[t] || 0) + 1;
    }

    // 4. Build per-topic response array
    const topics = Object.entries(solvedByTopic).map(([topic, diff]) => {
      const solved   = diff.easy + diff.medium + diff.hard;
      const total    = totalMap[topic] || solved;
      const progress = total > 0 ? Math.round((solved / total) * 100) : 0;
      return { topic, solved, total, progress, easy: diff.easy, medium: diff.medium, hard: diff.hard };
    });

    // Sort by solved desc
    topics.sort((a, b) => b.solved - a.solved);

    res.json(topics);

  } catch (error) {
    console.error("DSA Data Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= INTERVIEW SECTION ================= */
export const getInterviewData = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.user._id;

    const mockCount = await UserProgress.countDocuments({
      userId,
      type: "interview",
    });

    res.status(200).json({
      interviewsCompleted: mockCount,
      upcoming: 0,
    });

  } catch (error) {
    console.error("Interview Data Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= MOCK TESTS ================= */
export const getTestsData = async (req, res) => {
  try {
    const userId = req.user.id;

    const testsTaken = await UserProgress.countDocuments({
      userId,
      type: "mock",
    });

    res.status(200).json({
      testsTaken,
      bestScore: 0,
    });

  } catch (error) {
    console.error("Tests Data Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= ACTIVITY TIMELINE ================= */
export const getActivityData = async (req, res) => {
  try {
    if (!req.user?._id && !req.user?.id) {
      return res.status(401).json({ message: "Unauthorized — user missing" });
    }

    const userId = req.user._id || req.user.id;
    const questions = getQuestions();

    const recentActivity = await UserProgress.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const enriched = recentActivity.map(rec => {
      const q = questions.find(p => p.id === rec.problemId);
      return {
        ...rec,
        problemId: q ? { title: q.title, difficulty: q.difficulty || "medium" } : { title: rec.problemId }
      };
    });

    res.status(200).json(enriched);

  } catch (error) {
    console.error("Activity Data Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};