import "reflect-metadata";
import { useContainer, DataSource } from "typeorm";
import { Container } from "typedi";

import { AppDataSource } from "./config/data-source.js";

useContainer(Container);

(async () => {
  await AppDataSource.initialize();
  console.log("Database connected successfully");

  Container.set(DataSource, AppDataSource);

  const { appModule } = await import("./app-module.js");
  const app = await appModule();

  app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  });
})();
