import { plainToClass } from "class-transformer";
import { IsInt, IsString, validateSync } from "class-validator";
import * as dotenv from "dotenv";

dotenv.config();

class EnvVars {
  @IsString() DB_HOST!: string;
  @IsInt() DB_PORT!: number;
  @IsString() DB_USERNAME!: string;
  @IsString() DB_PASSWORD!: string;
  @IsString() DB_NAME!: string;
  @IsString() JWT_SECRET!: string;
  @IsString() CORS_ORIGINS!: string;
}

const env = plainToClass(EnvVars, {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
});

const errors = validateSync(env, { skipMissingProperties: false });
if (errors.length) {
  console.error("Invalid environment variables:", errors);
  process.exit(1);
}

export const config = {
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  },
  jwtSecret: env.JWT_SECRET,
  corsOrigins: env.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
};
