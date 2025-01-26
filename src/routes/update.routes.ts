import { Request, Response, Router } from "express";
import { update } from "../controllers/update.controller";

export const updateRoutes = (app: Router) => {
  app.get("/update", async (req: Request, res: Response) => {
    await update(req, res);
  });
};  