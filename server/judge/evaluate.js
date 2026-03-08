import { executeJs } from "./executeJs.js";
import { executePython } from "./executePython.js";
import { executeCpp } from "./executeCpp.js";
import { executeJava } from "./executeJava.js";

export const evaluate = async (filePath, language) => {

  switch (language) {

    case "js":
      return executeJs(filePath);

    case "py":
      return executePython(filePath);

    case "cpp":
      return executeCpp(filePath);

    case "java":
      return executeJava(filePath);

    default:
      return {
        error: true,
        type: "Unsupported Language"
      };
  }
};