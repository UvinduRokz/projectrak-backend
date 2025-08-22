import { Router } from "express";
import passport from "passport";
import { assignmentRouter } from "./controller/assignment.controller.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const assignmentModule = (() => {
  const router = Router();
  router.use(
    "/subtasks",
    passport.initialize(),
    protect("admin"),
    assignmentRouter
  );
  return router;
})();
