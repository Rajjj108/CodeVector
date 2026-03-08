import Submission from "../models/Submission.js";

/* Returns "YYYY-MM-DD" in local server time */
const localDateStr = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getTodaySolveCount = async (userId) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return Submission.countDocuments({
    userId,
    status: "Accepted",
    updatedAt: { $gte: start, $lte: end },
  });
};

export const updateStreak = async (user) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayKey = localDateStr(todayStart); // ✅ local date string

  const lastDate = user.streak?.lastSolvedDate
    ? new Date(user.streak.lastSolvedDate)
    : null;

  if (lastDate) {
    // ✅ Compare as local date strings — avoids UTC midnight off-by-one
    const lastKey = localDateStr(lastDate);

    if (lastKey === todayKey) return; // already updated today

    // Calculate diff using local date strings to avoid timezone shifts
    const lastStart = new Date(lastDate);
    lastStart.setHours(0, 0, 0, 0);
    const diffDays = Math.round((todayStart - lastStart) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.streak.current = (user.streak.current || 0) + 1;
    } else {
      user.streak.current = 1;
      user.streak.restoreWindow = false;
    }
  } else {
    user.streak.current = 1;
  }

  if (user.streak.current > (user.streak.longest || 0)) {
    user.streak.longest = user.streak.current;
  }

  user.streak.lastSolvedDate = todayStart; // local midnight ✅
  await user.save();
};