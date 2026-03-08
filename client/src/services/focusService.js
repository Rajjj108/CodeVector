/**
 * focusService.js — Smart Today's Focus
 *
 * Strategy:
 *  1. Load available topics from /api/meta/topics (real DB names).
 *  2. Sort them into a learning-order syllabus (foundational first).
 *  3. Firestore doc users/{email}/focus/session tracks topicIndex + lastDate + solvedTodayIds[].
 *  4. New day + ≥ 3 solved yesterday → advance topic.
 *  5. Fetch up to 80 questions for current topic, filter globally-solved, pick 2E+1M+1H.
 *  6. Fallback: if 0 candidates, fetch any unsolved questions (no topic filter).
 */

import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import axios from "axios";

/* ── Preferred learning order — we'll map DB topic names to this order ── */
const PREFERRED_ORDER = [
  "array", "string", "hash", "two pointer", "sliding window",
  "stack", "queue", "linked list", "binary search", "recursion",
  "backtrack", "tree", "graph", "dynamic", "greedy", "math",
];

const orderScore = (name) => {
  const lower = name.toLowerCase();
  const idx   = PREFERRED_ORDER.findIndex(p => lower.includes(p));
  return idx === -1 ? 999 : idx;
};

/* Sort DB topics into a sensible curriculum order */
const buildSyllabus = (topicMap) => {
  const names = Object.keys(topicMap);
  return [...names].sort((a, b) => orderScore(a) - orderScore(b));
};

const todayStr = () => new Date().toISOString().slice(0, 10);

/* Deterministic day-based offset — same all day, different next day */
const dayOffset = () => Math.floor(Date.now() / 86_400_000) % 97;

const seededPick = (arr, count) => {
  if (!arr.length) return [];
  const start   = dayOffset() % arr.length;
  const rotated = [...arr.slice(start), ...arr.slice(0, start)];
  return rotated.slice(0, count);
};

const pickByDifficulty = (problems) => {
  const bucket = (d) => problems.filter(p => p.difficulty?.toLowerCase() === d);
  const picks  = [
    ...seededPick(bucket("easy"),   2),
    ...seededPick(bucket("medium"), 1),
    ...seededPick(bucket("hard"),   1),
  ];
  if (picks.length < 4) {
    const used   = new Set(picks.map(p => String(p.id ?? p.frontendId ?? p._id)));
    const extras = problems.filter(p => !used.has(String(p.id ?? p.frontendId ?? p._id)));
    picks.push(...seededPick(extras, 4 - picks.length));
  }
  return picks.slice(0, 4);
};

/* ── Axios helper ── */
const apiGet = async (url) => {
  const token = localStorage.getItem("token");
  const res   = await axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

/* ── Fetch questions for a topic (or no filter if topic is null) ── */
const fetchQuestions = async (topic) => {
  const params = new URLSearchParams({ page: 1, limit: 80 });
  if (topic) params.set("topic", topic);
  const data = await apiGet(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/questions?${params}`);
  const list = Array.isArray(data) ? data : (data.data ?? data.problems ?? []);
  return list;
};

/* ── Main export ── */
export const getFocusSession = async (email, progressMap = {}) => {
  // Step 1: load real topic list from DB
  let syllabus = [];
  try {
    const topicMap = await apiGet((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/meta/topics");
    syllabus = buildSyllabus(topicMap);
  } catch (_) {}

  // Fallback syllabus if API fails
  if (!syllabus.length) {
    syllabus = ["Array", "String", "Stack", "Linked List", "Binary Search",
                "Tree", "Graph", "Dynamic Programming", "Greedy", "Math"];
  }

  // Step 2: load Firestore session doc
  const focusRef = email ? doc(db, "users", email, "focus", "session") : null;
  let focusData  = null;
  if (focusRef) {
    try {
      const snap = await getDoc(focusRef);
      focusData  = snap.exists() ? snap.data() : null;
    } catch (_) {}
  }

  const today        = todayStr();
  const yesterday    = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const isNewDay     = !focusData || focusData.lastDate !== today;
  const solvedYest   = (focusData?.lastDate === yesterday)
    ? (focusData.solvedTodayIds ?? []).length : 0;

  let topicIndex = focusData?.topicIndex ?? 0;
  // Advance topic on a new day if ≥ 3 solved yesterday AND index is in range
  if (isNewDay && solvedYest >= 3) {
    topicIndex = (topicIndex + 1) % syllabus.length;
  }
  // Guard against index drift if syllabus changed
  topicIndex = Math.min(topicIndex, syllabus.length - 1);

  const topic          = syllabus[topicIndex];
  const solvedTodayIds = isNewDay ? [] : (focusData?.solvedTodayIds ?? []);

  // Persist session
  if (focusRef && email) {
    try {
      await setDoc(focusRef, { topicIndex, lastDate: today, solvedTodayIds }, { merge: true });
    } catch (_) {}
  }

  // Step 3: fetch questions and filter
  const globalSolved = new Set(
    Object.entries(progressMap)
      .filter(([, v]) => v?.status === "solved")
      .map(([k]) => String(k))
  );

  const filterGlobal = (list) =>
    list.filter(p => !globalSolved.has(String(p.id ?? p.frontendId ?? p._id)));

  // Primary: topic-filtered
  let candidates = [];
  try {
    const raw = await fetchQuestions(topic);
    candidates = filterGlobal(raw);
  } catch (_) {}

  // Fallback: if topic returned nothing, try without topic filter
  if (candidates.length === 0) {
    try {
      const raw = await fetchQuestions(null);
      candidates = filterGlobal(raw);
    } catch (_) {}
  }

  const problems = pickByDifficulty(candidates);

  return {
    topic,
    topicIndex,
    total:    syllabus.length,
    syllabus,
    problems,
    solvedTodayIds,
    isNewDay,
  };
};

/* Exported constant for breadcrumb rendering in UI */
export const TOPIC_SYLLABUS = [
  "Array", "String", "Hash Table", "Two Pointers", "Sliding Window",
  "Stack", "Queue", "Linked List", "Binary Search", "Recursion",
  "Backtracking", "Tree", "Graph", "Dynamic Programming", "Greedy", "Math",
];

/* Mark a problem solved in today's session */
export const markFocusSolved = async (email, questionId) => {
  if (!email || !questionId) return;
  try {
    const ref  = doc(db, "users", email, "focus", "session");
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const ids  = snap.data().solvedTodayIds ?? [];
    const qStr = String(questionId);
    if (ids.includes(qStr)) return;
    await updateDoc(ref, { solvedTodayIds: [...ids, qStr] });
  } catch (_) {}
};
