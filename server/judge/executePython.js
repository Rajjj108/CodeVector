import { runCommand } from "./baseExecutor.js";

export const executePython = (filePath, input) => {
  return runCommand(
    `python ${filePath}`,
    input
  );
};