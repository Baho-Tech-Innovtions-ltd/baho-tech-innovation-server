import { Router } from "express";
import { accessibilityOptions } from "./accessibility.controller.js";

export const accessibilityRoutes = Router();

accessibilityRoutes.get("/options", accessibilityOptions);
