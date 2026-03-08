/**
 * rebuildAllProblemsFixed.js
 *
 * Reads merged_problems.json (raw) and writes allProblems.json with:
 *   - id:         "LC_{frontend_id}"
 *   - title
 *   - difficulty
 *   - topic:      first tag (primary)
 *   - topics:     all topic tags
 *
 * Run from the project root:
 *   node server/scripts/rebuildAllProblemsFixed.js
 */

import fs from "fs";
import path from "path";

const RAW_PATH = path.resolve(
  "server/data/question-bank/raw/merged_problems.json"
);

const OUT_PATH = path.resolve(
  "server/data/question-bank/indexes/allProblems.json"
);

console.log("📂 Reading raw dataset...");
const rawJSON = JSON.parse(fs.readFileSync(RAW_PATH, "utf-8"));

/* Detect array location */
let problemsArray;
if (Array.isArray(rawJSON)) {
  problemsArray = rawJSON;
} else if (Array.isArray(rawJSON.questions)) {
  problemsArray = rawJSON.questions;
} else if (Array.isArray(rawJSON.problems)) {
  problemsArray = rawJSON.problems;
} else if (Array.isArray(rawJSON.data)) {
  problemsArray = rawJSON.data;
} else {
  console.error("❌ Could not locate problems array in raw data.");
  console.log("Top keys:", Object.keys(rawJSON));
  process.exit(1);
}

console.log(`📦 Total raw problems: ${problemsArray.length}`);

/* Normalize each problem */
const formatted = problemsArray
  .map((p) => {
    // Raw data uses snake_case: frontend_id, problem_id
    const frontendId =
      p.frontend_id ||
      p.frontendId  ||
      p.problem_id  ||
      p.problemId   ||
      p.id          ||
      null;

    if (!frontendId) return null; // skip problems without id

    const id     = `LC_${frontendId}`;
    const topics = p.topics || p.topicTags || p.tags || [];

    return {
      id,
      title:      p.title || p.name || "Untitled",
      difficulty: p.difficulty || "Unknown",
      topic:      topics[0] || "Other",
      topics,
      slug:       p.problem_slug || p.slug || "",
    };
  })
  .filter(Boolean); // remove nulls

console.log(`✅ Valid problems (with IDs): ${formatted.length}`);

fs.writeFileSync(OUT_PATH, JSON.stringify(formatted, null, 2));
console.log(`💾 Written to: ${OUT_PATH}`);
