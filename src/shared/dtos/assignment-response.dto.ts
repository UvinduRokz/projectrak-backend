import { Expose } from "class-transformer";

export class AssignmentResponseDto {
  @Expose({ name: "subtaskId" })
  subtask_id!: string;

  @Expose({ name: "employeeId" })
  employee_id!: string;

  @Expose({ name: "assignedAt" })
  assigned_at!: Date;
}
