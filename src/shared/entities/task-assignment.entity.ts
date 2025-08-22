import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Subtask } from "./subtask.entity.js";
import { Employee } from "./employee.entity.js";

@Entity({ name: "task_assignments" })
export class TaskAssignment {
  @PrimaryColumn({ name: "subtask_id", type: "char", length: 36 })
  subtaskId!: string;

  @PrimaryColumn({ name: "employee_id", type: "char", length: 36 })
  employeeId!: string;

  @ManyToOne(() => Subtask, (subtask) => subtask.assignments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "subtask_id" })
  subtask!: Subtask;

  @ManyToOne(() => Employee, { onDelete: "CASCADE" })
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @CreateDateColumn({ name: "assigned_at", type: "datetime" })
  assignedAt!: Date;
}
