import "reflect-metadata";
import { DataSource } from "typeorm";
import { useContainer as ormUseContainer } from "typeorm";
import { Container } from "typedi";
import { config } from "./config.module.js";

import { User } from "@/shared/entities/user.entity.js";
import { Employee } from "@/shared/entities/employee.entity.js";
import { Company } from "@/shared/entities/company.entity.js";
import { Project } from "@/shared/entities/project.entity.js";
import { ProjectVersion } from "@/shared/entities/project-version.entity.js";
import { Task } from "@/shared/entities/task.entity.js";
import { Subtask } from "@/shared/entities/subtask.entity.js";
import { TaskAssignment } from "@/shared/entities/task-assignment.entity.js";
import { PrmUpload } from "@/shared/entities/prm-upload.entity.js";

ormUseContainer(Container);

export const AppDataSource = new DataSource({
  type: "mysql",
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: false,
  logging: false, 
  entities: [
    User,
    Employee,
    Company,
    Project,
    ProjectVersion,
    Task,
    Subtask,
    TaskAssignment,
    PrmUpload,
  ],
  migrations: [],
  subscribers: [],
});
