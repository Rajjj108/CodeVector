import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_CONFIG = [
  { name: "gemini-3.1-flash-lite", dailyLimit: 500 },
  { name: "gemini-2.5-flash", dailyLimit: 20 },
  { name: "gemini-3-flash", dailyLimit: 20 },
  { name: "gemini-2.5-flash-lite", dailyLimit: 20 },
];

let modelIndex = 0;

const usage = {};
const requestTimestamps = [];

function resetDailyUsageIfNeeded() {
  const today = new Date().toDateString();

  if (usage._day !== today) {
    usage._day = today;

    MODEL_CONFIG.forEach(m => {
      usage[m.name] = 0;
    });
  }
}

function getAvailableModel() {
  resetDailyUsageIfNeeded();

  for (let i = 0; i < MODEL_CONFIG.length; i++) {
    const idx = (modelIndex + i) % MODEL_CONFIG.length;
    const model = MODEL_CONFIG[idx];

    if (usage[model.name] < model.dailyLimit) {
      modelIndex = (idx + 1) % MODEL_CONFIG.length;
      usage[model.name]++;
      return model.name;
    }
  }

  throw new Error("All Gemini models exhausted for today");
}

function enforceRateLimit() {
  const now = Date.now();

  while (
    requestTimestamps.length &&
    now - requestTimestamps[0] > 60000
  ) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= 30) {
    throw new Error("Rate limit exceeded: 30 requests per minute");
  }

  requestTimestamps.push(now);
}

export async function analyzeCode(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  enforceRateLimit();

  const modelName = getAvailableModel();

  console.log(`[Gemini] Using: ${modelName}`);

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  const result = await model.generateContent(prompt);

  return result.response.text();
}