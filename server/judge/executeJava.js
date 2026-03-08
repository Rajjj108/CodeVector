import { runCommand } from "./baseExecutor.js";
import path from "path";

export const executeJava = async (filePath, input) => {

  const dir = path.dirname(filePath);
  const file = path.basename(filePath);

  const compile = await runCommand(
    `javac ${filePath}`
  );

  if (compile.error) return compile;

  const className = file.replace(".java", "");

  return runCommand(
    `java -cp ${dir} ${className}`,
    input
  );
};