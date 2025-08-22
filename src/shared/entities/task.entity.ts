import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ProjectVersion } from "./project-version.entity.js";
import { Subtask } from "./subtask.entity.js";

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  COMPLETED = "completed",
}

@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "project_version_id", type: "char", length: 36 })
  projectVersionId!: string;

  @ManyToOne(() => ProjectVersion, (version) => version.tasks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_version_id" })
  projectVersion!: ProjectVersion;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  category?: string;

  @Column({ type: "enum", enum: TaskPriority })
  priority!: TaskPriority;

  @Column({ type: "enum", enum: TaskStatus })
  status!: TaskStatus;

  @Column({ type: "int", default: 0 })
  progress!: number;

  @Column({
    name: "estimated_time",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  estimatedTime?: string;

  @Column({
    name: "remaining_time",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  remainingTime?: string;

  @Column({ name: "due_date", type: "date", nullable: true })
  dueDate?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @OneToMany(() => Subtask, (subtask) => subtask.task, { cascade: true })
  subtasks!: Subtask[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
