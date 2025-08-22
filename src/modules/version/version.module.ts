import { Router } from "express";
import passport from "passport";
import { versionRouter } from "./controller/version.controller.js";

export const versionModule = (() => {
  const router = Router();
  router.use(passport.initialize(), versionRouter);
  return router;
})();
