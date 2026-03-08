import fs from "fs";
import path from "path";

const file = path.join(
  process.cwd(),
  "server/data/question-bank/raw/merged_problems.json"
);

const raw = JSON.parse(fs.readFileSync(file, "utf-8"));

console.log("TYPE:", typeof raw);
console.log("IS ARRAY:", Array.isArray(raw));
console.log("KEYS:", Object.keys(raw).slice(0, 10));