/**
 * userService.js — Steps 8 & 9
 *
 * fetchUserProfile  — reads top-level user doc for dashboard overview
 * fetchProgressMap  — reads all progress sub-docs, returns { [questionId]: data }
 */
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

/* ── Step 8: Profile overview ── */
export const fetchUserProfile = async (email) => {
  if (!email) return null;
  const snap = await getDoc(doc(db, "users", email));
  if (!snap.exists()) return { totalTime: 0, solvedCount: 0, attemptedCount: 0, currentStreak: 0, longestStreak: 0 };
  return snap.data();
};

/* ── Step 9: All per-question progress for merge ── */
export const fetchProgressMap = async (email) => {
  if (!email) return {};
  const ref      = collection(db, "users", email, "progress");
  const snapshot = await getDocs(ref);
  const map = {};
  snapshot.forEach((d) => { map[d.id] = d.data(); });
  return map;
};
