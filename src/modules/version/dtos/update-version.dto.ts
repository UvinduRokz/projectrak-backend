import { Expose } from "class-transformer";
import { IsEnum, IsOptional, IsInt, Min, Max } from "class-validator";
import { VersionStatus } from "@/shared/entities/project-version.entity.js";

export class UpdateVersionDto {
  @Expose()
  @IsOptional()
  @IsEnum(VersionStatus)
  status?: VersionStatus;

  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}
