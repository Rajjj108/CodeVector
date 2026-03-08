import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

export const generateFile = (language, code) => {
  const jobId = uuid();

  const dirCodes = path.join("temp", "codes");

  if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
  }

  const filePath = path.join(
    dirCodes,
    `${jobId}.${language}`
  );

  fs.writeFileSync(filePath, code);

  return filePath;
};