import fs from "fs";
import path from "path";

const RAW_PATH = path.resolve(
  "server/data/question-bank/raw/merged_problems.json"
);

const OUT_PATH = path.resolve(
  "server/data/question-bank/indexes/allProblems.json"
);

console.log("📂 Reading dataset...");

const rawText = fs.readFileSync(RAW_PATH, "utf-8");
const rawJSON = JSON.parse(rawText);

/* Detect array location */
let problemsArray = null;

if (Array.isArray(rawJSON)) {
  problemsArray = rawJSON;
} else if (Array.isArray(rawJSON.problems)) {
  problemsArray = rawJSON.problems;
} else if (Array.isArray(rawJSON.data)) {
  problemsArray = rawJSON.data;
} else if (Array.isArray(rawJSON.questions)) {
  problemsArray = rawJSON.questions;
} else {
  console.error("❌ Could not locate problems array.");
  console.log("Top keys:", Object.keys(rawJSON));
  process.exit(1);
}

console.log("📦 Total problems:", problemsArray.length);

/* Normalize */
const formatted = problemsArray.map((p, i) => ({
  id:
    p.id ||
    p.lcId ||
    p.problemId ||
    p.questionId ||
    p.frontendId ||
    `GEN_${i}`,

  title: p.title || p.name || "Untitled",

  difficulty: p.difficulty || "Unknown",

  topic:
    p.topic ||
    p.topics?.[0] ||
    p.tags?.[0] ||
    "Other",

  tags: p.tags || p.topics || [],
}));

fs.writeFileSync(
  OUT_PATH,
  JSON.stringify(formatted, null, 2)
);

console.log("✅ allProblems.json rebuilt successfully");