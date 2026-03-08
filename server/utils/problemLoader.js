import fs from "fs";
import path from "path";

const QUESTIONS_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/formatted/questions.json"
);

let cache = null;

export const getAllProblems = () => {
  if (!cache) {
    cache = JSON.parse(
      fs.readFileSync(QUESTIONS_PATH, "utf-8")
    );
  }
  return cache;
};

export const getProblemById = (id) => {
  const problems = getAllProblems();
  return problems.find(p => p.id === id);
};