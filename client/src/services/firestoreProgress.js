/**
 * firestoreProgress.js — Steps 6 & 7
 *
 * saveProgress  — upsert per-question Firestore doc + user totals
 * updateStreak  — date-aware streak (call only on "solved")
 */
import {
  doc, setDoc, updateDoc, getDoc, increment, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/* ── Step 6: Save / update per-question progress ── */
export const saveProgress = async ({ email, questionId, status, timeSpent = 0 }) => {
  if (!email || !questionId) return;

  const userRef     = doc(db, "users", email);
  const progressRef = doc(db, "users", email, "progress", questionId);
  const progressSnap = await getDoc(progressRef);

  if (progressSnap.exists()) {
    const existing = progressSnap.data();
    await updateDoc(progressRef, {
      timeSpent:       increment(timeSpent),
      attempts:        increment(1),
      // Only escalate status (attempted → solved), never downgrade
      status:          status === "solved" ? "solved" : existing.status,
      lastAttemptedAt: serverTimestamp(),
    });
    // If this attempt upgraded status to solved, increment user counter
    if (status === "solved" && existing.status !== "solved") {
      await setDoc(userRef, { solvedCount: increment(1) }, { merge: true });
    }
  } else {
    // First attempt at this problem
    await setDoc(progressRef, {
      status,
      timeSpent,
      attempts:        1,
      lastAttemptedAt: serverTimestamp(),
    });
    await setDoc(userRef, {
      totalTime:      increment(timeSpent),
      solvedCount:    status === "solved" ? increment(1) : increment(0),
      attemptedCount: increment(1),
    }, { merge: true });
  }
};

/* ── Step 7: Date-aware streak — call only when status === "solved" ── */
export const updateStreak = async (email) => {
  if (!email) return;
  const userRef = doc(db, "users", email);
  const snap    = await getDoc(userRef);
  const today   = new Date().toISOString().split("T")[0];

  if (!snap.exists()) {
    await setDoc(userRef, { currentStreak: 1, longestStreak: 1, lastActiveDate: today }, { merge: true });
    return;
  }

  const data     = snap.data();
  const lastDate = data.lastActiveDate;
  if (lastDate === today) return; // already updated today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yDate   = yesterday.toISOString().split("T")[0];
  const newStreak = lastDate === yDate ? (data.currentStreak || 0) + 1 : 1;

  await updateDoc(userRef, {
    currentStreak:  newStreak,
    longestStreak:  Math.max(newStreak, data.longestStreak || 0),
    lastActiveDate: today,
  });
};
