// server/scripts/testJudge.js
import fetch from "node-fetch";

const res = await fetch(
  "http://localhost:5000/api/submissions",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      problemId: "CV_1",
      language: "javascript",
      code: "console.log('hello')",
      timeTaken: 100,
      activeTime: 100
    })
  }
);

console.log(await res.json());