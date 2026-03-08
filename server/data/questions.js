import fs from "fs";

const questions = JSON.parse(
  fs.readFileSync("./question-bank/formatted/questions.json")
);

export default questions;