import { Router } from "express";
import passport from "passport";
import { taskRouter } from "./controller/task.controller.js";

export const taskModule = (() => {
  const router = Router();
  router.use(passport.initialize(), taskRouter);
  return router;
})();
