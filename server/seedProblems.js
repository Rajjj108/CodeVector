import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Problem from "./models/Problem.js";

dotenv.config();
connectDB();

const problems = [
  { title: "Two Sum", topic: "Array", difficulty: "Easy" },
  { title: "Best Time to Buy Sell Stock", topic: "Array", difficulty: "Easy" },
  { title: "Kadane’s Algorithm", topic: "Array", difficulty: "Medium" },
  { title: "Longest Substring Without Repeating", topic: "String", difficulty: "Medium" },
  { title: "Valid Parentheses", topic: "Stack", difficulty: "Easy" },
  { title: "Climbing Stairs", topic: "DP", difficulty: "Easy" },
  { title: "Coin Change", topic: "DP", difficulty: "Medium" },
  { title: "Number of Islands", topic: "Graph", difficulty: "Medium" },
];

const seedProblems = async () => {
  try {
    await Problem.deleteMany();
    await Problem.insertMany(problems);

    console.log("Problems Seeded 🌱");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProblems();