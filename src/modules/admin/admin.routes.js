import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware.js";
import { stats, userDetails, users } from "./admin.controller.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireAdmin);
adminRoutes.get("/stats", stats);
adminRoutes.get("/overview", stats);
adminRoutes.get("/users", users);
adminRoutes.get("/users/:id", userDetails);
