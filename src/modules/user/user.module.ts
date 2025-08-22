import { Router } from "express";
import passport from "passport";
import { userRouter } from "./controller/user.controller.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const userModule = (() => {
  const router = Router();

  router.use("/users", passport.initialize(), protect("admin"), userRouter);
  return router;
})();
