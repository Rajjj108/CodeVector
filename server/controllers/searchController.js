import { searchProblems } from "../utils/searchEngine.js";

export const search = (req, res) => {
  const { q } = req.query;

  if (!q) return res.json([]);

  const results = searchProblems(q);

  res.json(results);
};