import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { interpretGesture } from "./sign-language.controller.js";

export const signLanguageRoutes = Router();

signLanguageRoutes.use(requireAuth);
signLanguageRoutes.post("/interpret", interpretGesture);
