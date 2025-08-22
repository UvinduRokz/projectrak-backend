import { Expose, Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { CreateSubtaskDto } from "../../subtask/dtos/create-subtask.dto.js";

export class CreateTaskDto {
  @Expose()
  @IsString()
  title!: string;

  @Expose()
  @IsOptional()
  @IsString()
  category!: string;

  @Expose({ name: "estimated_time" })
  @IsOptional()
  @IsString()
  estimatedTime!: string;

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
