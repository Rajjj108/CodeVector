import express from "express";
import { getAllTopics } from "../controllers/metaController.js";

const router = express.Router();

router.get("/topics", getAllTopics);

export default router;