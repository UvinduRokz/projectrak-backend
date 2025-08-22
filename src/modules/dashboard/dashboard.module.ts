import { Router } from "express";
import passport from "passport";
import { dashboardRouter } from "./controller/dashboard.controller.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const dashboardModule = (() => {
  const router = Router();
  router.use("/dashboards", passport.initialize(), protect("admin"), dashboardRouter);
  return router;
})();
