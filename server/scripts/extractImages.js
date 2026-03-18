import fs from "fs";
import path from "path";

/* ===== PATHS ===== */

const RAW_PATH = path.join(
  process.cwd(),
  "server/data/merged_problems.json"
);

const OUT_PATH = path.join(
  process.cwd(),
  "server/data/question-bank/indexes/imagesIndex.json"
);

/* ===== LOAD RAW DATA ===== */

const rawData = JSON.parse(
  fs.readFileSync(RAW_PATH, "utf-8")
);

const questions = rawData.questions || rawData;

const imagesIndex = {};

/* ===== EXTRACT IMAGES ===== */

questions.forEach((q) => {
  const images = [];

  (q.examples || []).forEach((ex) => {
    if (ex.images?.length > 0) {
      images.push(...ex.images);
    }
  });

  if (images.length > 0) {
    imagesIndex[`CV_${q.problem_id}`] = images;
  }
});

/* ===== SAVE ===== */

fs.writeFileSync(
  OUT_PATH,
  JSON.stringify(imagesIndex, null, 2)
);

console.log(
  `✅ Extracted images for ${Object.keys(imagesIndex).length} problems`
);