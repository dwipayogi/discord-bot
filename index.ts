import express, { Request, Response } from "express";
const app = express();

import { interactionRoutes } from "./src/routes/interaction.routes";
import { registerRoutes } from "./src/routes/register.routes";
import { reminderRoutes } from "./src/routes/reminder.routes";
import { updateRoutes } from "./src/routes/update.routes";

app.get("/", (req: Request, res: Response) => {
  res.send("Dwipa Yogi's Discord Bot API");
});

// routes
interactionRoutes(app);
registerRoutes(app);
reminderRoutes(app);
updateRoutes(app);

app.listen(8999, () => {});
