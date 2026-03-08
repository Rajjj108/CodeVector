import fs from "fs";
import path from "path";

const FILE_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/formatted/questions.json"
);

const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));

data.forEach((q) => {
  // Skip if already has hidden cases
  if (q.hiddenTestCases?.length > 0) return;

  // If examples exist, create hidden variants
  if (q.examples?.length > 0) {
    q.hiddenTestCases = q.examples.map((ex, i) => ({
      input: ex.inputText || "",
      output: ex.outputText || "",
      hidden: true
    }));
  } else {
    q.hiddenTestCases = [];
  }
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

console.log("✅ Hidden testcases generated");