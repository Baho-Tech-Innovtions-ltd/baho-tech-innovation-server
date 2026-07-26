import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { analyzeVision } from "./vision.controller.js";

export const visionRoutes = Router();

visionRoutes.use(requireAuth);
visionRoutes.post("/analyze", analyzeVision);
