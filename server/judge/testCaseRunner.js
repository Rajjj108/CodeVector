import { exec } from "child_process";

export const runTestCase = (command, input) => {
  return new Promise((resolve) => {
    const process = exec(command, (error, stdout) => {
      if (error) {
        resolve({ error: true });
      } else {
        resolve({ output: stdout.trim() });
      }
    });

    process.stdin.write(input);
    process.stdin.end();
  });
};import { executeCode } from "./baseExecutor.js";

export const runTestCases = async ({
  code,
  language,
  testCases
}) => {
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];

    const output = await executeCode({
      code,
      language,
      input: tc.input
    });

    const passed =
      output.trim() === tc.output.trim();

    results.push({
      input: tc.input,
      expected: tc.output,
      output,
      passed
    });
  }

  return results;
};