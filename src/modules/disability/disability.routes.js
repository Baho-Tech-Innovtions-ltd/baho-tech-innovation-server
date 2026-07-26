import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { listDisabilityCategories, myDisabilityAccess } from "./disability.controller.js";

export const disabilityRoutes = Router();

disabilityRoutes.get("/categories", listDisabilityCategories);
disabilityRoutes.get("/access", requireAuth, myDisabilityAccess);
