import fs from "fs";
import path from "path";

const SOURCE = path.join(
  process.cwd(),
  "server/data/question-bank/formatted/questions.json"
);

const OUT_DIR = path.join(
  process.cwd(),
  "server/data/question-bank/indexes"
);

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(SOURCE, "utf-8"));

const topicsIndex = {};
const difficultyIndex = {};
const topicDifficultyIndex = {};
const idMap = {};
const stats = { total: data.length, difficulty: {} };

data.forEach((q) => {
  const { id, topic, difficulty } = q;

  // Topic
  if (!topicsIndex[topic]) topicsIndex[topic] = [];
  topicsIndex[topic].push(id);

  // Difficulty
  if (!difficultyIndex[difficulty]) difficultyIndex[difficulty] = [];
  difficultyIndex[difficulty].push(id);

  // Topic + Difficulty
  if (!topicDifficultyIndex[topic]) {
    topicDifficultyIndex[topic] = { easy: [], medium: [], hard: [] };
  }
  topicDifficultyIndex[topic][difficulty].push(id);

  // ID Map
  idMap[id] = {
    title: q.title,
    topic,
    difficulty,
  };
});

// Stats
Object.keys(difficultyIndex).forEach((d) => {
  stats.difficulty[d] = difficultyIndex[d].length;
});

// Write files
fs.writeFileSync(`${OUT_DIR}/topicsIndex.json`, JSON.stringify(topicsIndex, null, 2));
fs.writeFileSync(`${OUT_DIR}/difficultyIndex.json`, JSON.stringify(difficultyIndex, null, 2));
fs.writeFileSync(`${OUT_DIR}/topicDifficultyIndex.json`, JSON.stringify(topicDifficultyIndex, null, 2));
fs.writeFileSync(`${OUT_DIR}/idMap.json`, JSON.stringify(idMap, null, 2));
fs.writeFileSync(`${OUT_DIR}/stats.json`, JSON.stringify(stats, null, 2));

console.log("✅ Indexes built successfully");