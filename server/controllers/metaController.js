import fs from "fs";
import path from "path";

export const getAllTopics = (req, res) => {
  try {
    const filePath = path.join(
      process.cwd(),
      "server/data/question-bank/indexes/topicsIndex.json"
    );

    const topics = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    res.json(topics);

  } catch (error) {
    console.error("Topics Load Error:", error);
    res.status(500).json({ message: "Failed to load topics" });
  }
};