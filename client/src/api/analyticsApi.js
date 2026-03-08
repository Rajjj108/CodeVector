import api from "./axios";

export const getTotalTime = () =>
  api.get("/analytics/total-time");

export const getAvgDifficulty = () =>
  api.get("/analytics/avg-difficulty");

export const getFastestSolve = () =>
  api.get("/analytics/fastest");

export const getHeatmap = () =>
  api.get("/analytics/heatmap");