import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { assistWriting, translateWriting } from "./writing.controller.js";

export const writingRoutes = Router();

writingRoutes.use(requireAuth);
writingRoutes.post("/assist", assistWriting);
writingRoutes.post("/translate", translateWriting);
