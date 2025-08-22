import { Router } from "express";
import passport from "passport";
import { companyRouter } from "./controller/company.controller.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const companyModule = (() => {
  const router = Router();
  router.use("/companies", passport.initialize(), protect(), companyRouter);
  return router;
})();
