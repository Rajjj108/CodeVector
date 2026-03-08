/**
 * codeService.js
 * ─────────────────────────────────────────────
 * All code execution & submission calls for
 * the InterviewPrep code editor.
 *
 * Exports:
 *   runCode(code, language)
 *   submitCode(problemId, code, language)
 *   getSubmissions(problemId)
 *   getSubmissionById(submissionId)
 */

import api from "./axios";

/* ─── Supported languages ────────────────────── */
export const SUPPORTED_LANGUAGES = ["javascript", "python", "java", "cpp"];

/* ─── Run code (no auth required) ───────────── */
/**
 * @param {string} code
 * @param {string} language  — one of SUPPORTED_LANGUAGES
 * @returns {{ output: string }}
 */
export const runCode = async (code, language) => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw { message: `Unsupported language: ${language}`, status: 400 };
  }

  const { data } = await api.post("/api/code/run", { code, language });
  return data;                    // { output }
};

/* ─── Submit code (auth required) ───────────── */
/**
 * @param {string} problemId
 * @param {string} code
 * @param {string} language
 * @param {{ timeTaken?: number, activeTime?: number }} [meta]
 * @returns {{ verdict: string, selfSolved: boolean, submissionId: string }}
 */
export const submitCode = async (problemId, code, language, meta = {}) => {
  if (!problemId) throw { message: "problemId is required", status: 400 };
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw { message: `Unsupported language: ${language}`, status: 400 };
  }

  const { data } = await api.post("/api/submissions/submit", {
    problemId,
    code,
    language,
    timeTaken:  meta.timeTaken  ?? 0,
    activeTime: meta.activeTime ?? 0,
  });

  return data;                    // { verdict, selfSolved, submissionId }
};

/* ─── Get all submissions for a problem ─────── */
/**
 * @param {string} problemId
 * @returns {Array<Submission>}
 */
export const getSubmissions = async (problemId) => {
  if (!problemId) throw { message: "problemId is required", status: 400 };
  const { data } = await api.get(`/api/submissions/${problemId}`);
  return data;                    // Submission[]
};

/* ─── Get single submission by ID ────────────── */
/**
 * @param {string} submissionId
 * @returns {Submission}
 */
export const getSubmissionById = async (submissionId) => {
  if (!submissionId) throw { message: "submissionId is required", status: 400 };
  const { data } = await api.get(`/api/submissions/detail/${submissionId}`);
  return data;
};