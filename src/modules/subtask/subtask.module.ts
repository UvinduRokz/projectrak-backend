import { Router } from "express";
import passport from "passport";
import { subtaskRouter } from "./controller/subtask.controller.js";

export const subtaskModule = (() => {
  const router = Router();
  router.use("/tasks", passport.initialize(), subtaskRouter);
  return router;
})();
