import { Expose } from "class-transformer";

export class EmployeeProgressDto {
  @Expose({ name: "employeeId" })
  employee_id!: string;

  @Expose({ name: "assignedSubtasks" })
  assigned_subtasks!: number;

  @Expose({ name: "completedSubtasks" })
  completed_subtasks!: number;

  @Expose({ name: "completionRate" })
  completion_rate!: number;
}
