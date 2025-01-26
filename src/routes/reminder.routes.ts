import { Request, Response, Router } from "express";
import { reminder } from "../controllers/reminder.controller";

export const reminderRoutes = (app: Router) => {
  app.get("/reminder", async (req: Request, res: Response) => {
    await reminder(req, res);
  });
};