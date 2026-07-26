import { Router } from "express";
import { themeOptions } from "./theme.controller.js";

export const themeRoutes = Router();

themeRoutes.get("/options", themeOptions);
