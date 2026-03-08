/**
 * progressService.js
 * ─────────────────────────────────────────────
 * All user progress & streak API calls for
 * InterviewPrep.
 *
 * Exports:
 *   getUserProgress()
 *   getProgressForProblem(problemId)
 *   updateProblemStatus(problemId, status)
 *   getDashboardSummary()
 *   getStreak()
 *   getHeatmapData()
 *   getAnalytics()
 */

import api from "./axios";

/* ─── Valid status values ────────────────────── */
export const STATUSES = ["Not Started", "In Progress", "Revision", "Solved"];

/* ─── Get all progress for the current user ──── */
/**
 * @returns {Progress[]}  — array of { problemId, status, solvedAt, timeTaken }
 */
export const getUserProgress = async () => {
  const { data } = await api.get("/api/progress");
  return data;
};

/* ─── Get progress for a single problem ─────── */
/**
 * @param {string} problemId
 * @returns {Progress | null}
 */
export const getProgressForProblem = async (problemId) => {
  if (!problemId) throw { message: "problemId is required", status: 400 };
  const { data } = await api.get(`/api/progress/${problemId}`);
  return data;
};

/* ─── Update status for a problem ────────────── */
/**
 * @param {string} problemId
 * @param {string} status    — one of STATUSES
 * @returns {{ problemId, status, updatedAt }}
 */
export const updateProblemStatus = async (problemId, status) => {
  if (!problemId) throw { message: "problemId is required", status: 400 };
  if (!STATUSES.includes(status)) {
    throw { message: `Invalid status: "${status}". Must be one of: ${STATUSES.join(", ")}`, status: 400 };
  }

  const { data } = await api.post("/api/progress/update", { problemId, status });
  return data;
};

/* ─── Get dashboard summary ──────────────────── */
/**
 * @returns {{
 *   totalSolved: number,
 *   streak: { current: number, longest: number },
 *   solvedToday: number,
 *   weakTopics: string[],
 *   completionPercent: number,
 * }}
 */
export const getDashboardSummary = async () => {
  const { data } = await api.get("/api/dashboard/summary");
  return data;
};

/* ─── Get streak details ─────────────────────── */
/**
 * @returns {{ current: number, longest: number, lastActiveDate: string }}
 */
export const getStreak = async () => {
  const { data } = await api.get("/api/progress/streak");
  return data;
};

/* ─── Get heatmap data (activity by date) ────── */
/**
 * @param {{ days?: number }} [options]  — default: last 365 days
 * @returns {Array<{ date: string, count: number }>}
 */
export const getHeatmapData = async ({ days = 365 } = {}) => {
  const { data } = await api.get("/api/progress/heatmap", {
    params: { days },
  });
  return data;
};

/* ─── Get full analytics ─────────────────────── */
/**
 * @returns {{
 *   totalTime: number,
 *   avgSolveTime: number,
 *   fastestSolve: { problem: string, time: number },
 *   byDifficulty: { Easy: number, Medium: number, Hard: number },
 *   byTopic: Record<string, number>,
 * }}
 */
export const getAnalytics = async () => {
  const { data } = await api.get("/api/progress/analytics");
  return data;
};

/* ─── Helper: merge problems with progress ───── */
/**
 * Merges a problems array with a progress array into
 * a single list with `.status` attached to each problem.
 *
 * @param {Problem[]}  problems
 * @param {Progress[]} progressList
 * @returns {Problem[]}
 */
export const mergeProblemsWithProgress = (problems, progressList) => {
  const map = {};
  progressList.forEach((p) => { map[p.problemId] = p.status; });
  return problems.map((p) => ({
    ...p,
    status: map[p._id] ?? "Not Started",
  }));
};