import { Router } from "express";
import passport from "passport";
import { employeeRouter } from "./controller/employee.controller.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const employeeModule = (() => {
  const router = Router();

  router.use("/employees", passport.initialize(), protect(), employeeRouter);
  return router;
})();
