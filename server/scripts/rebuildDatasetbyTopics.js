import fs from "fs";
import path from "path";

const INPUT = path.join(
  process.cwd(),
  "server/data/question-bank/raw/merged_problems.json"
);

const OUTPUT = path.join(
  process.cwd(),
  "server/data/question-bank/indexes/allProblems.json"
);

let raw = JSON.parse(fs.readFileSync(INPUT, "utf-8"));

/* Normalize */
if (!Array.isArray(raw)) {
  if (raw.problems) raw = raw.problems;
  else if (raw.questions) raw = raw.questions;
  else if (raw.data?.questions) raw = raw.data.questions;
  else raw = Object.values(raw);
}

const formatted = raw.map((p, i) => ({

  id:
    p.frontendId
      ? `CV_${p.frontendId}`
      : `GEN_${i + 1}`,

  title: p.title || p.name,

  difficulty: p.difficulty || "Unknown",

  topic:
    p.topicTags?.[0] ||
    p.tags?.[0] ||
    "Other",

  tags:
    p.topicTags ||
    p.tags ||
    [],
}));

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(formatted, null, 2)
);

console.log("✅ Rebuilt:", formatted.length);