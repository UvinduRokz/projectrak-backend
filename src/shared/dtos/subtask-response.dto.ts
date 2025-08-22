import { Expose, Type } from "class-transformer";
import { AssignmentResponseDto } from "./assignment-response.dto.js";

export class SubtaskResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  completed!: boolean;

  @Expose({ name: "timeEstimate" })
  time_estimate?: string;

  @Expose({ name: "taskId" })
  task_id!: string;

  @Expose({ name: "createdAt" })
  created_at!: Date;

  @Expose({ name: "updatedAt" })
  updated_at!: Date;

  @Expose({ name: "assignments" })
  @Type(() => AssignmentResponseDto)
  assignments?: AssignmentResponseDto[];
}
