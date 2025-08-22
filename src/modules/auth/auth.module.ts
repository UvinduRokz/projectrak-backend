import { Router } from "express";

import { authRouter } from "./controller/auth.controller.js";

export const authModule = (() => {
  const router = Router();
  router.use("/auth", authRouter);
  return router;
})();
