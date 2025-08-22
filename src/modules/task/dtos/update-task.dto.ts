import { Expose, Type } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { TaskStatus } from "@/shared/entities/task.entity.js";
import { CreateSubtaskDto } from "../../subtask/dtos/create-subtask.dto.js";

export class UpdateTaskDto {
  @Expose()
  @IsOptional()
  @IsString()
  id!: string;

  @Expose()
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @IsOptional()
  @IsString()
  category?: string;

  @Expose()
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Expose({ name: "estimated_time" })
  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @Expose({ name: "due_date" })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasks?: CreateSubtaskDto[];
}
