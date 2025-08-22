import { Router } from "express";
import passport from "passport";
import { prmRouter } from "./controller/prm.controller.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const prmModule = (() => {
  const router = Router();
  router.use("/prms", passport.initialize(), protect(), prmRouter);
  return router;
})();
