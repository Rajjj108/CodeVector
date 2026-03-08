import { runCommand } from "./baseExecutor.js";
import path from "path";

export const executeCpp = async (filePath, input) => {

  const outputFile =
    filePath.replace(".cpp", ".exe");

  const compile = await runCommand(
    `g++ ${filePath} -o ${outputFile}`
  );

  if (compile.error) return compile;

  return runCommand(outputFile, input);
};