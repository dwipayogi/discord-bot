import { Router, Request, Response } from "express";
import { PUBLIC_KEY } from "../lib/db";
import { verifyKeyMiddleware } from "discord-interactions";
import { interaction } from "../controllers/interaction.controller";

export const interactionRoutes = (app: Router) => {
  app.post("/interactions", verifyKeyMiddleware(PUBLIC_KEY as string), async (req: Request, res: Response) => {
    await interaction(req, res);
  });
};
