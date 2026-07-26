import { Router } from "express";
import { languageOptions, translateDynamicContent } from "./translation.controller.js";

export const translationRoutes = Router();

translationRoutes.get("/languages", languageOptions);
translationRoutes.post("/translate", translateDynamicContent);
