import mongoose from "mongoose";

const testcaseSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
});

const problemSchema = new mongoose.Schema({
  title: String,
  topic: String,
  difficulty: String,
  description: String,
  starterCode: String,
  testcases: [testcaseSchema],
});

export default mongoose.model("Problem", problemSchema);