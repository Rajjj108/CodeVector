import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import problemsRoute from "./routes/problems.js";
import progressRoute from "./routes/progress.js";
import path from "path";
import { fileURLToPath } from "url";
import protect from "./middleware/authMiddleware.js";
import codeRoute from "./routes/code.js";
import dashboardSummary from "./routes/dashboardSummary.js";
import submissionRoute from "./routes/submissions.js";
import analyticsRoute from "./routes/analytics.js";
import cookieParser from "cookie-parser";
import submissionRoutes from "./routes/submissionRoutes.js";
import "./utils/cronJobs.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import aiRoutes from "./routes/ai.routes.js";
import { fork } from "child_process";





console.log("Server starting...");


/* ===== Fix __dirname ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===== Load ENV ===== */
dotenv.config({ path: path.join(__dirname, ".env") });

/* ===== Connect DB ===== */
connectDB();

/* ===== Judge Worker (separate process for code execution) ===== */
let judgeWorker = null;

const spawnJudgeWorker = () => {
  judgeWorker = fork(path.join(__dirname, "judgeWorker.js"));
  judgeWorker.on("exit", (code) => {
    console.warn(`[server] judgeWorker exited (${code}), respawning...`);
    setTimeout(spawnJudgeWorker, 500);
  });
  judgeWorker.on("error", (err) => {
    console.error("[server] judgeWorker error:", err.message);
  });
};
spawnJudgeWorker();
export { judgeWorker };

const app = express();

/* ===== Middleware ===== */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://codevector.onrender.com",
    "https://codevectorweb.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


/* ===== Routes ===== */
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/problems", problemsRoute);
app.use("/api/progress", progressRoute);
app.use("/api/code", codeRoute);
app.use("/api/dashboard", dashboardSummary);
app.use("/api/submissions", submissionRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/submission", submissionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/meta",   metaRoutes);
app.use("/api/notes",  notesRoutes);
app.use("/api/ai", aiRoutes);



/* ===== Test Route ===== */
app.get("/", (req, res) => {
  res.send("API Running...");
});

/* ===== Protected Test ===== */
app.get("/api/protected", protect, (req, res) => {
  res.json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
});

/* ===== Server Start ===== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});