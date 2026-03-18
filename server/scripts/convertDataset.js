import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const RAW_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/raw/merged_problems.json"
);

const OUT_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/formatted/questions.json"
);

const rawData = JSON.parse(fs.readFileSync(RAW_PATH, "utf-8"));

const questionsArray = rawData.questions;

console.log("Total Raw Questions:", questionsArray.length);

const formatted = questionsArray.map((q) => ({
  id: `CV_${q.problem_id}`,
  title: q.title,
  slug: q.problem_slug,
  topic: q.topics?.[0] || "General",
  tags: q.topics || [],
  difficulty: q.difficulty.toLowerCase(),
  description: q.description || "",
  constraints: q.constraints || [],
  examples: (q.examples || []).map((ex) => {
    const parts = ex.example_text.split("Output:");
    return {
      inputText: parts[0]?.replace("Input:", "").trim(),
      outputText: parts[1]?.split("Explanation:")[0]?.trim(),
    };
  }),
  starterCode: {
    javascript: q.code_snippets?.javascript || "",
    python: q.code_snippets?.python3 || q.code_snippets?.python || "",
    java: q.code_snippets?.java || "",
    cpp: q.code_snippets?.cpp || "",
  },
  hints: q.hints || [],
  testCases: [],
  hiddenTestCases: [],
}));

fs.writeFileSync(OUT_PATH, JSON.stringify(formatted, null, 2));

console.log("✅ Conversion Completed");