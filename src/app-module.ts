import "reflect-metadata";
import express, { json, Router, type ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import { config } from "./config/config.module.js";
import { setupSwagger } from "./config/swagger.config.js";
import passport from "passport";
import { localStrategy } from "@/shared/strategies/local.strategy.js";
import { jwtStrategy } from "@/shared/strategies/jwt.strategy.js";

import { authModule } from "./modules/auth/auth.module.js";
import { companyModule } from "./modules/company/company.module.js";
import { userModule } from "./modules/user/user.module.js";
import { employeeModule } from "./modules/employee/employee.module.js";
import { projectModule } from "./modules/project/project.module.js";
import { versionModule } from "./modules/version/version.module.js";
import { taskModule } from "./modules/task/task.module.js";
import { subtaskModule } from "./modules/subtask/subtask.module.js";
import { assignmentModule } from "./modules/assignment/assignment.module.js";
import { prmModule } from "./modules/prm/prm.module.js";
import { dashboardModule } from "./modules/dashboard/dashboard.module.js";

const { JsonWebTokenError } = jwt;

export async function appModule() {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );

  app.use(json());

  const apiRouter = Router();

  passport.use(localStrategy);
  passport.use(jwtStrategy);
  app.use(passport.initialize());

  apiRouter.use(authModule);
  apiRouter.use(companyModule);
  apiRouter.use(userModule);
  apiRouter.use(employeeModule);
  apiRouter.use(projectModule);
  apiRouter.use(versionModule);
  apiRouter.use(taskModule);
  apiRouter.use(subtaskModule);
  apiRouter.use(assignmentModule);
  apiRouter.use(prmModule);
  apiRouter.use(dashboardModule);

  setupSwagger(app);
  app.use("/api", apiRouter);

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (Array.isArray(err)) {
      return res.status(400).json({ errors: err });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: err.message });
    }
    const status = (err as any).status ?? 500;
    const message = (err as any).message ?? "Internal Server Error";
    return res.status(status).json({ message });
  };
  app.use(errorHandler);

  return app;
}
