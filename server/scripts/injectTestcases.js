import fs from "fs";
import path from "path";

const FILE_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/formatted/questions.json"
);

const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));

data.forEach((q) => {
  if ((!q.testCases || q.testCases.length === 0) && q.examples?.length > 0) {
    q.testCases = q.examples.map((ex) => ({
      input: ex.inputText || "",
      output: ex.outputText || ""
    }));
  }
});

fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

console.log("✅ Testcases injected from examples");