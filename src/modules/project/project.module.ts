import { Router } from "express";
import { projectRouter } from "./controller/project.controller.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const projectModule = (() => {
  const router = Router();
  router.use("/projects", protect("admin"), projectRouter);
  return router;
})();
