/**
 * judgeWorker.js — Isolated code-execution worker process
 *
 * Architecture:
 *   API Server (server.js) ─ fork() ─▶ judgeWorker.js ─▶ executeCode()
 *
 * Communication: Node IPC (process.send / process.on("message"))
 *
 * Benefits:
 *  - If user code crashes Node, only this worker dies — the API server lives on
 *  - API server auto-respawns the worker if it exits unexpectedly
 *  - No shared state between API and execution environment
 */

import { executeCode } from "./judge/baseExecutor.js";

process.on("message", async (job) => {
  const { jobId, code, language, input } = job;

  try {
    const result = await executeCode({ code, language, input: input || "" });
    process.send({ jobId, ...result });
  } catch (err) {
    process.send({ jobId, error: err.message });
  }
});

/* Prevent silent exits */
process.on("uncaughtException", (err) => {
  console.error("[judgeWorker] uncaughtException:", err.message);
  // Keep running; let the API server handle re-spawning if needed
});

process.on("unhandledRejection", (reason) => {
  console.error("[judgeWorker] unhandledRejection:", reason);
});

console.log("[judgeWorker] ready, pid:", process.pid);
