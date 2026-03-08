import { runTestCases } from "./testCaseRunner.js";

export const runSubmission = async ({
  code,
  language,
  testCases
}) => {
  const results = await runTestCases({
    code,
    language,
    testCases
  });

  const allPassed = results.every(r => r.passed);

  return {
    verdict: allPassed ? "Accepted" : "Wrong Answer",
    results
  };
};