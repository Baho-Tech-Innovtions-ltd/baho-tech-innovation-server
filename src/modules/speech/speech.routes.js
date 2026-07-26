import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { capabilities, optimizeTextForSpeech, transcribeAudio } from "./speech.controller.js";

export const speechRoutes = Router();

speechRoutes.get("/capabilities", capabilities);
speechRoutes.post("/transcribe", requireAuth, transcribeAudio);
speechRoutes.post("/optimize-tts", requireAuth, optimizeTextForSpeech);
