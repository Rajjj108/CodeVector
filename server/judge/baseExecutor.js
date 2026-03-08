/**
 * baseExecutor.js — Shared command runner using spawn (not exec)
 * Safer: no shell, timeout 2000ms, maxBuffer 1 MB, SIGKILL on timeout
 */
import { executeJs }     from "./executeJs.js";
import { executePython } from "./executePython.js";
import { executeCpp }    from "./executeCpp.js";
import { executeJava }   from "./executeJava.js";
import { spawn }         from "child_process";

/* ===================================== */
/*    SHARED COMMAND RUNNER (secure)     */
/* ===================================== */

export const runCommand = (command, input = "") => {
  return new Promise((resolve) => {
    const TIMEOUT = 2000;
    let   settled = false;
    const settle  = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    /* Split command string into executable + args (no shell) */
    const [exe, ...args] = command.split(" ");

    const child = spawn(exe, args, {
      timeout:   TIMEOUT,
      maxBuffer: 1024 * 1024,
      shell:     false,          // explicitly no shell → no injection
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.on("close", () => {
      clearTimeout(killer);
      settle(stderr ? { error: stderr } : { output: stdout });
    });

    child.on("error", (err) => {
      clearTimeout(killer);
      settle({ error: err.message });
    });

    /* Hard kill after TIMEOUT */
    const killer = setTimeout(() => {
      try { child.kill("SIGKILL"); } catch {}
      settle({ error: "Time Limit Exceeded (2000ms)" });
    }, TIMEOUT);
  });
};

/* ===================================== */
/*         LANGUAGE ROUTER               */
/* ===================================== */

export const executeCode = async ({ code, language, input }) => {
  switch (language) {
    case "javascript":
      return executeJs(code, input);

    case "python":
      return executePython(code, input);

    case "cpp":
      return executeCpp(code, input);

    case "java":
      return executeJava(code, input);

    default:
      throw new Error("Unsupported language");
  }
};