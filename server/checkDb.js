import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import UserProgress from './models/UserProgress.js';
import Submission from './models/Submission.js';
import Heatmap from './models/Heatmap.js';

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://mayankrajwarsi123:CodeVektor123@@ac-ln44v99-shard-00-01.nchhggm.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const progress = await UserProgress.find({}).sort({ updatedAt: -1 }).limit(5).lean();
    console.log("\n--- LATEST USER PROGRESS ---");
    console.log(JSON.stringify(progress, null, 2));

    const submissions = await Submission.find({}).sort({ updatedAt: -1 }).limit(5).lean();
    console.log("\n--- LATEST SUBMISSIONS ---");
    console.log(JSON.stringify(submissions, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
