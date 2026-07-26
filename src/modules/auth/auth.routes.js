import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { login, logout, me, register } from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", requireAuth, logout);
