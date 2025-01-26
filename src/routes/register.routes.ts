import { Request, Response, Router } from "express";
import { register } from "../controllers/register.controller";

export const registerRoutes = (app: Router) => {
  app.get("/register_commands", async (req: Request, res: Response) => {
    await register(req, res);
  });
};