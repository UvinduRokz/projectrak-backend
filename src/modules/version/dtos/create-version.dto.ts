import { Expose, Type } from "class-transformer";
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from "class-validator";
import { VersionStatus } from "@/shared/entities/project-version.entity.js";
import { CreateTaskDto } from "../../task/dtos/create-task.dto.js";

export class CreateVersionDto {
  @Expose()
  @IsOptional()
  @IsString()
  version?: string;

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

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks?: CreateTaskDto[];
}
