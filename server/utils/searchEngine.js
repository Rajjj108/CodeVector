import fs from "fs";
import path from "path";

/* ===== LOAD INDEX ===== */

const SEARCH_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/indexes/searchIndex.json"
);

let cache = null;

const loadIndex = () => {
  if (!cache) {
    cache = JSON.parse(
      fs.readFileSync(SEARCH_PATH, "utf-8")
    );
  }
  return cache;
};

/* ===== SEARCH FUNCTION ===== */

export const searchProblems = (query) => {
  const index = loadIndex();
  const q = query.toLowerCase();

  const results = index.filter((p) =>
    p.tokens.some((token) =>
      token.includes(q)
    )
  );

  return results.slice(0, 50);
};