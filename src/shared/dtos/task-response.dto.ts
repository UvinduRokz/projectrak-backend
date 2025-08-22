import { Expose, Type } from "class-transformer";
import { TaskPriority, TaskStatus } from "@/shared/entities/task.entity.js";
import { SubtaskResponseDto } from "./subtask-response.dto.js";
import { VersionResponseDto } from "./version-response.dto.js";

export class TaskResponseDto {
  @Expose({ name: "projectId" })
  project_id?: string;

  @Expose({ name: "projectName" })
  project_name?: string;

  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  category?: string;

  @Expose()
  priority!: TaskPriority;

  @Expose()
  status!: TaskStatus;

  @Expose()
  progress!: number;

  @Expose({ name: "projectVersionId" })
  project_version_id!: string;

  @Expose({ name: "projectVersion" })
  @Type(() => VersionResponseDto)
  project_version?: VersionResponseDto;

  @Expose({ name: "estimatedTime" })
  estimated_time?: string;

  @Expose({ name: "remainingTime" })
  remaining_time?: string;

  @Expose({ name: "dueDate" })
  due_date?: string;

  @Expose()
  description?: string;

  @Expose({ name: "createdAt" })
  created_at!: Date;

  @Expose({ name: "updatedAt" })
  updated_at!: Date;

  @Expose({ name: "subtasks" })
  @Type(() => SubtaskResponseDto)
  subtasks?: SubtaskResponseDto[];
}
