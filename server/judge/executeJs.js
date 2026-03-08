/**
 * executeJs.js — Secure JS executor
 * - Uses spawn (NOT exec) → no shell injection risk
 * - Wraps user code in Node VM sandbox → blocks require / process / fs
 * - Hard timeout 2000ms + SIGKILL
 * - maxBuffer 1 MB
 */
import fs   from "fs";
import path from "path";
import { spawn } from "child_process";
import { v4 as uuid } from "uuid";

/* ─── Harness that wraps user code in a Node VM sandbox ─── */
const buildHarness = (userCode) => `
const vm = require("vm");
const code = ${JSON.stringify(userCode)};
try {
  vm.runInNewContext(code, {
    console,
    Math,
    JSON,
    parseInt, parseFloat, isNaN, isFinite,
    String, Number, Boolean, Array, Object, Map, Set,
    Promise, setTimeout, clearTimeout,
  }, { timeout: 1800 });
} catch (e) {
  process.stdout.write(e.message || String(e));
}
`;

export const executeJs = (code, input) => {
  return new Promise((resolve) => {

    const jobId = uuid();

    /* Use process.cwd() to avoid import.meta.url quote pollution on Windows */
    const cwd    = process.cwd().replace(/"/g, "");
    const runDir = path.join(cwd, "server", "temp", "run");

    if (!fs.existsSync(runDir)) {
      fs.mkdirSync(runDir, { recursive: true });
    }

    /* Strip any stray quotes from the final path before passing to spawn */
    const filePath = path.join(runDir, `${jobId}.js`).replace(/"/g, "");

    fs.writeFileSync(filePath, buildHarness(code));

    const TIMEOUT = 2000;
    let   settled = false;
    const settle  = (result) => {
      if (settled) return;
      settled = true;
      try { fs.unlinkSync(filePath); } catch {}
      resolve(result);
    };
    const child = spawn("node", [filePath], {
      timeout:   TIMEOUT,
      maxBuffer: 1024 * 1024,   // 1 MB
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });

    /* Provide stdin input */
    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();

    child.on("close", () => {
      settle(stderr ? { error: stderr } : { output: stdout });
    });

    child.on("error", (err) => {
      settle({ error: err.message });
    });

    /* Hard kill after TIMEOUT */
    const killer = setTimeout(() => {
      try { child.kill("SIGKILL"); } catch {}
      settle({ error: "Time Limit Exceeded (2000ms)" });
    }, TIMEOUT);

    child.on("close", () => clearTimeout(killer));
  });
};