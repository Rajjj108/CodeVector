import fs from "fs";
import path from "path";

const DATASET = path.join(
  process.cwd(),
  "server/data/question-bank/raw/merged_problems.json"
);

const OUTPUT = path.join(
  process.cwd(),
  "server/data/question-bank/indexes/topicsIndex.json"
);

let raw = JSON.parse(fs.readFileSync(DATASET, "utf-8"));

/* ── Normalize dataset to array ── */
if (!Array.isArray(raw)) {

  if (raw.problems) {
    raw = raw.problems;
  }

  else if (raw.questions) {
    raw = raw.questions;
  }

  else if (raw.data?.questions) {
    raw = raw.data.questions;
  }

  else {
    raw = Object.values(raw);
  }
}

console.log("📦 Total problems:", raw.length);

/* ── Extract topics ── */
const topicMap = {};

raw.forEach((p) => {

  const topics =
    p.topicTags ||
    p.tags ||
    p.topics ||
    [];

  topics.forEach((t) => {

    if (!topicMap[t]) {
      topicMap[t] = 0;
    }

    topicMap[t]++;
  });
});

fs.writeFileSync(
  OUTPUT,
  JSON.stringify(topicMap, null, 2)
);

console.log("✅ Topics extracted:", Object.keys(topicMap).length);