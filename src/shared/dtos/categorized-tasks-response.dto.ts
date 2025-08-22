import { Expose, Type } from "class-transformer";
import { TaskResponseDto } from "./task-response.dto.js";

export class CategorizedTasksResponseDto {
  @Expose()
  category!: string;

  @Expose()
  @Type(() => TaskResponseDto)
  tasks!: TaskResponseDto[];
}
