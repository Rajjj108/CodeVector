import fs from "fs";
import path from "path";

const QUESTIONS_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/formatted/questions.json"
);

const OUT_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/indexes/searchIndex.json"
);

const data = JSON.parse(
  fs.readFileSync(QUESTIONS_PATH, "utf-8")
);

const searchIndex = data.map((q) => ({
  id: q.id,
  title: q.title,
  slug: q.slug,
  topic: q.topic,
  difficulty: q.difficulty,

  // searchable tokens
  tokens: [
    q.id,
    q.title.toLowerCase(),
    q.slug.toLowerCase(),
    ...(q.tags || []).map(t => t.toLowerCase())
  ]
}));

fs.writeFileSync(
  OUT_PATH,
  JSON.stringify(searchIndex, null, 2)
);

console.log("✅ Search index built");