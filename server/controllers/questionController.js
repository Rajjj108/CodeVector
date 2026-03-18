import fs from "fs";
import path from "path";

/* ─────────────────────────────────────────────
   Helper → Load JSON
───────────────────────────────────────────── */
const loadJSON = (relPath) => {
  const abs = path.join(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(abs, "utf-8"));
};

/* ─────────────────────────────────────────────
   In-memory cache — parsed once on first request,
   then reused for all subsequent calls.
───────────────────────────────────────────── */
let _cachedProblems = null;

const getAllProblems = () => {
  if (_cachedProblems) return _cachedProblems;

  // allProblems.json (rebuilt by rebuildAllProblemsFixed.js) has
  // correct CV_* ids and real topics[] arrays.
  _cachedProblems = loadJSON(
    "server/data/question-bank/indexes/allProblems.json"
  );

  console.log(`📚 Loaded ${_cachedProblems.length} problems into cache.`);
  return _cachedProblems;
};

/* ─────────────────────────────────────────────
   Helper → Normalize strings for safe compare
───────────────────────────────────────────── */
const normalize = (s) =>
  s
    ?.toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* ─────────────────────────────────────────────
   GET /api/questions
   Query → page, limit, topic, difficulty
───────────────────────────────────────────── */
export const getQuestions = (req, res) => {
  try {
    /* ── Query params ── */
    const page       = parseInt(req.query.page)  || 1;
    const limit      = parseInt(req.query.limit) || 50;
    const topic      = req.query.topic || "All";
    const difficulty = req.query.difficulty || "All";

    console.log("📥 Topic from API:", topic);
    console.log("📥 Difficulty from API:", difficulty);

    const allProblems    = getAllProblems();
    const normTopic      = normalize(topic);
    const normDifficulty = normalize(difficulty);

    /* ─────────────────────────────────────────
       Filter → Topic (any tag) + Difficulty
    ───────────────────────────────────────── */
    const filtered = allProblems.filter((p) => {
      const topicMatch =
        topic === "All"
          ? true
          : (p.topics || []).some((t) => normalize(t) === normTopic);

      const difficultyMatch =
        difficulty === "All"
          ? true
          : normalize(p.difficulty) === normDifficulty;

      return topicMatch && difficultyMatch;
    });

    console.log(
      `📊 Filtered: ${filtered.length} / ${allProblems.length}`
    );

    /* ─────────────────────────────────────────
       Pagination
    ───────────────────────────────────────── */
    const total  = filtered.length;
    const sliced = filtered.slice(
      (page - 1) * limit,
      page * limit
    );

    return res.json({ data: sliced, total, page, limit });

  } catch (error) {
    console.error("[QC] Error:", error);
    return res.status(500).json({ message: "Failed to load questions" });
  }
};

/* ─────────────────────────────────────────────
   GET /api/questions/:id
───────────────────────────────────────────── */
export const getQuestionById = (req, res) => {
  try {
    const allProblems = getAllProblems();
    const targetId    = req.params.id; // e.g. "CV_1"

    // First, try the lightweight allProblems index
    const shallow = allProblems.find((p) => p.id === targetId);
    if (!shallow) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Then try to enrich with description/examples from the raw file
    try {
      const rawData = loadJSON(
        "server/data/question-bank/raw/merged_problems.json"
      );
      const rawArr = Array.isArray(rawData)
        ? rawData
        : rawData.questions || rawData.problems || [];

      const raw = rawArr.find((p) => {
        const fid = p.frontend_id || p.frontendId || p.problem_id;
        return fid && `CV_${fid}` === targetId;
      });

      if (raw) {
        const topics = raw.topics || raw.topicTags || raw.tags || [];
        return res.json({
          ...shallow,
          topics,
          topic:        topics[0] || "Other",
          description:  raw.description || "",
          examples: (raw.examples || []).map((ex) => ({
            input:  ex.example_text?.split("\n")[0]?.replace("Input: ", "") ?? ex.input ?? "",
            output: ex.example_text?.split("\n")[1]?.replace("Output: ", "") ?? ex.output ?? "",
          })),
          code_snippets: raw.code_snippets || {},
          starterCode:   raw.code_snippets || {},
          slug:          raw.problem_slug || raw.slug || "",
        });
      }
    } catch (_) {
      // fall through to shallow response
    }

    return res.json(shallow);

  } catch (error) {
    console.error("[QC] getQuestionById error:", error);
    return res.status(500).json({ message: "Failed to load question" });
  }
};