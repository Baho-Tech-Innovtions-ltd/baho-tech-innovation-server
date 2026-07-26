import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { command, conversation, navigationHelp, screenReaderSummary } from "./ai-assistant.controller.js";

export const aiAssistantRoutes = Router();

aiAssistantRoutes.use(requireAuth);
aiAssistantRoutes.post("/navigation-help", navigationHelp);
aiAssistantRoutes.post("/screen-reader", screenReaderSummary);
aiAssistantRoutes.post("/conversation", conversation);
aiAssistantRoutes.post("/command", command);
