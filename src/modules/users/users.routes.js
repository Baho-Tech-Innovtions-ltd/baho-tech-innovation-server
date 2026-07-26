import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { dashboardAccess, profile, updatePreferences } from "./users.controller.js";

export const userRoutes = Router();

userRoutes.get("/profile", requireAuth, profile);
userRoutes.get("/dashboard-access", requireAuth, dashboardAccess);
userRoutes.patch("/preferences", requireAuth, updatePreferences);
