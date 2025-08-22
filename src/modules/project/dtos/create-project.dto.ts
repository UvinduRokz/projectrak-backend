import { Expose, Type } from "class-transformer";
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { CreateVersionDto } from "@/modules/version/dtos/create-version.dto.js";
import { CreateTaskDto } from "@/modules/task/dtos/create-task.dto.js";

export class CreateProjectDto {
  @Expose({ name: "company_id" })
  @IsUUID("4")
  companyId!: string;

  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVersionDto)
  versions?: CreateVersionDto[];

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks?: CreateTaskDto[];
}
