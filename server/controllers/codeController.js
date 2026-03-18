/**
 * codeController.js
 *
 * POST /api/code/run   — runs against visible test cases, returns per-case results
 * POST /api/code/submit — runs against all test cases + saves submission (wraps submissionController logic cleanly)
 *
 * The key insight: CodeVector-style inputs like "nums = [2,7,11,15], target = 9"
 * cannot be piped to stdin. We build a per-language harness that:
 *  1. Wraps the user's Solution/function code
 *  2. Evaluates the parsed input and calls the function
 *  3. Prints the result via console.log / print
 */

import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { spawn } from "child_process";
import { runCommand } from "../judge/baseExecutor.js";

// Resolve path relative to project root
const QUESTIONS_PATH = path.join(
  process.cwd().replace(/"/g, ""),
  "server", "data", "question-bank", "formatted", "questions.json"
);

let _questions = null;
const getQuestions = () => {
  if (!_questions) {
    _questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));
  }
  return _questions;
};

/* ══════════════════════════════════════════════════════════════════
   OUTPUT NORMALIZATION
   Handles CodeVector "custom judge" outputs like "2, nums = [2,2,_,_]"
   and pseudocode test cases that should be skipped.
══════════════════════════════════════════════════════════════════ */

/**
 * Filter: return false for test cases that are pseudocode/documentation,
 * not real executable inputs.
 */
export const isValidTestCase = (tc) => {
  const input = (tc.input || "");
  // Skip if input looks like Java/C++ pseudocode or CodeVector description blocks
  if (input.includes("//") && input.includes("assert")) return false;
  if (/int\[\]|int \w+ =|sort\(/.test(input)) return false;
  if (input.trim().length === 0) return false;
  return true;
};

/**
 * Normalize expected output for comparison.
 * CodeVector custom judge problems output like:
 *   "2, nums = [2,2,_,_]"  →  just compare "2"
 *   "5, nums = [0,1,4,0,3,_,_,_]"  →  just compare "5"
 *   "[0,1]"  →  compare "[0,1]" as-is
 */
export const normalizeExpected = (expected) => {
  const str = (expected || "").trim();
  // Pattern: "<number>, <variable> = [...]" → extract just the number
  const customJudgeMatch = str.match(/^(-?\d+(?:\.\d+)?),?\s*\w+\s*=/);
  if (customJudgeMatch) return customJudgeMatch[1];
  // Remove any trailing ", <varname> = [...]" suffix
  const suffixMatch = str.match(/^(.+?),\s*\w+\s*=\s*\[/);
  if (suffixMatch) return suffixMatch[1].trim();
  return str;
};

/**
 * Smart comparison: normalize both sides, then try JSON equality.
 * Handles: "2" == 2, "[0,1]" == "[0,1]", "true" == true
 */
export const judgeEqual = (actual, rawExpected) => {
  const a = (actual || "").trim();
  const e = normalizeExpected(rawExpected);
  if (a === e) return true;
  try {
    return JSON.stringify(JSON.parse(a)) === JSON.stringify(JSON.parse(e));
  } catch { return false; }
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

/* ══════════════════════════════════════════════════════════════════
   HARNESS BUILDERS
   Each takes (userCode, inputStr) and returns a complete runnable
   file content as a string.
══════════════════════════════════════════════════════════════════ */

/**
 * JavaScript harness.
 * Parses the CodeVector-style input string (e.g. "nums = [2,7,11,15], target = 9")
 * into a JS object, then calls every exported function in userCode.
 */
const buildJsHarness = (userCode, inputStr) => {
  // We parse the input string at runtime inside the harness
  return `
// ── User solution ──
${userCode}

// ── Harness ──
(function() {
  try {
    const rawInput = ${JSON.stringify(inputStr)};

    // Parse "key = value, key2 = value2, ..." into an object
    const args = {};
    // Split on top-level commas (not inside brackets)
    let depth = 0, cur = '', parts = [];
    for (let i = 0; i < rawInput.length; i++) {
      const c = rawInput[i];
      if (c === '[' || c === '(' || c === '{') depth++;
      else if (c === ']' || c === ')' || c === '}') depth--;
      if (c === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    if (cur.trim()) parts.push(cur.trim());

    const positional = [];
    parts.forEach(part => {
      const eqIdx = part.indexOf('=');
      if (eqIdx !== -1) {
        const key = part.slice(0, eqIdx).trim();
        const val = part.slice(eqIdx + 1).trim();
        try { args[key] = JSON.parse(val); } catch { args[key] = val.replace(/^"|"$/g,''); }
        positional.push(args[key]);
      } else {
        try { positional.push(JSON.parse(part)); } catch { positional.push(part); }
      }
    });

    // Try to find and call the user's function
    // Look for: var X = function(, function X(, const X = (
    const fnMatch = ${JSON.stringify(userCode)}.match(/(?:var|const|let)\\s+(\\w+)\\s*=\\s*function|function\\s+(\\w+)\\s*\\(/);
    let result;
    if (fnMatch) {
      const fnName = fnMatch[1] || fnMatch[2];
      if (typeof eval(fnName) === 'function') {
        result = eval(fnName)(...positional);
      }
    }

    if (result === undefined) {
      // Try calling via Solution class
      const sol = new Solution();
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(sol)).filter(m => m !== 'constructor');
      if (methods.length > 0) result = sol[methods[0]](...positional);
    }

    console.log(JSON.stringify(result));
  } catch (err) {
    console.error('Runtime Error:', err.message);
    process.exit(1);
  }
})();
`;
};

/**
 * Python harness.
 */
const buildPythonHarness = (userCode, inputStr) => {
  return `
import json, sys

# ── User solution ──
${userCode}

# ── Harness ──
def parse_input(raw):
    args = {}
    positional = []
    depth = 0
    cur = ''
    parts = []
    for c in raw:
        if c in '([{': depth += 1
        elif c in ')]}': depth -= 1
        if c == ',' and depth == 0:
            parts.append(cur.strip())
            cur = ''
        else:
            cur += c
    if cur.strip():
        parts.append(cur.strip())
    for part in parts:
        idx = part.find('=')
        if idx != -1:
            key = part[:idx].strip()
            val = part[idx+1:].strip()
            try:
                parsed = json.loads(val)
            except:
                parsed = val.strip('"').strip("'")
            args[key] = parsed
            positional.append(parsed)
        else:
            try:
                positional.append(json.loads(part))
            except:
                positional.append(part)
    return positional

try:
    positional = parse_input(${JSON.stringify(inputStr)})
    sol = Solution()
    method = [m for m in dir(sol) if not m.startswith('_')][0]
    result = getattr(sol, method)(*positional)
    print(json.dumps(result))
except Exception as e:
    print(f"Runtime Error: {e}", file=sys.stderr)
    sys.exit(1)
`;
};

/* ══════════════════════════════════════════════════════════════════
   FILE WRITERS
══════════════════════════════════════════════════════════════════ */

/* ─── Absolute temp dir (avoids CWD-relative issues) ─── */
const ROOT_DIR = process.cwd().replace(/"/g, "");
const TEMP_DIR = path.join(ROOT_DIR, "server", "temp", "run");

const writeTemp = (ext, content) => {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
  const file = path.join(TEMP_DIR, `${uuid()}.${ext}`);
  fs.writeFileSync(file, content, "utf-8");
  return file;
};

const safeDelete = (f) => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {} };

/* ══════════════════════════════════════════════════════════════════
   EXECUTE ONE TEST CASE
══════════════════════════════════════════════════════════════════ */

/* ─── Direct spawn helper — no shell, no quote wrapping ─── */
const spawnRun = (exe, args, input = "", timeoutMs = 5000) =>
  new Promise((resolve) => {
    let settled = false;
    const settle = (r) => { if (!settled) { settled = true; clearTimeout(killer); resolve(r); } };

    const child = spawn(exe, args, { timeout: timeoutMs, maxBuffer: 1024 * 1024, shell: false });
    let out = "", err = "";
    child.stdout.on("data", d => { out += d; });
    child.stderr.on("data", d => { err += d; });
    if (input) child.stdin.write(input);
    child.stdin.end();
    child.on("close", () => settle(err ? { error: err } : { output: out }));
    child.on("error", e => settle({ error: e.message }));
    const killer = setTimeout(() => {
      try { child.kill("SIGKILL"); } catch {}
      settle({ error: "Time Limit Exceeded (5000ms)" });
    }, timeoutMs);
  });

/* ══════════════════════════════════════════════════════════════════
   EXECUTE ONE TEST CASE
══════════════════════════════════════════════════════════════════ */

export const runOneCase = async (userCode, language, inputStr) => {
  let filePath = null;
  try {
    if (language === "javascript") {
      const harness = buildJsHarness(userCode, inputStr);
      filePath = writeTemp("js", harness);
      return await spawnRun("node", [filePath]);
    }

    if (language === "python") {
      const harness = buildPythonHarness(userCode, inputStr);
      filePath = writeTemp("py", harness);
      return await spawnRun("python", [filePath]);
    }

    if (language === "cpp") {
      filePath = writeTemp("cpp", userCode);
      const exePath = filePath.replace(".cpp", ".exe");
      const compile = await spawnRun("g++", [filePath, "-o", exePath]);
      if (compile.error) return compile;
      const result = await spawnRun(exePath, [], inputStr);
      safeDelete(exePath);
      return result;
    }

    if (language === "java") {
      const classMatch = userCode.match(/public\s+class\s+(\w+)/);
      const className  = classMatch ? classMatch[1] : "Solution";
      const dir        = TEMP_DIR;
      filePath         = path.join(dir, `${className}.java`);
      fs.writeFileSync(filePath, userCode, "utf-8");
      const compile = await spawnRun("javac", [filePath]);
      if (compile.error) return compile;
      return await spawnRun("java", ["-cp", dir, className], inputStr);
    }

    return { error: "Unsupported language" };
  } finally {
    if (filePath) safeDelete(filePath);
  }
};

/* ══════════════════════════════════════════════════════════════════
   POST /api/code/run
══════════════════════════════════════════════════════════════════ */

export const runCode = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "code and language are required" });
    }

    // If problemId, load visible test cases (filter out pseudocode cases).
    let testCases = [];
    if (problemId) {
      const problems = getQuestions();
      const problem  = problems.find(p => p.id === problemId);
      if (problem) {
        testCases = (problem.testCases || [])
          .filter(isValidTestCase)
          .slice(0, 3); // show first 3 valid cases
      }
    }

    // No test cases → just run code bare (useful for quick scripts)
    if (testCases.length === 0) {
      const result = await runCommand(
        language === "python" ? `python -c "${code.replace(/"/g, '\\"')}"` : `node -e "${code.replace(/"/g, '\\"')}"`,
        ""
      );
      return res.json({
        type: "raw",
        output: result.output || result.error || "",
        error:  !!result.error,
      });
    }

    // Run against each visible test case
    const results = [];
    for (const tc of testCases) {
      const result = await runOneCase(code, language, tc.input);
      const actualOutput   = (result.output || "").trim();
      const rawExpected    = (tc.output || "").trim();
      const passed = !result.error && judgeEqual(actualOutput, rawExpected);
      results.push({
        input:    tc.input,
        expected: normalizeExpected(rawExpected), // show clean expected, not pseudocode
        actual:   actualOutput,
        passed,
        error:    result.error ? String(result.error) : null,
      });
    }

    const allPassed = results.every(r => r.passed);
    res.json({ type: "testcases", results, allPassed });

  } catch (error) {
    console.error("Run Error:", error);
    res.status(500).json({ message: "Run server error", detail: error.message });
  }
};
