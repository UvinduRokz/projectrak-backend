import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Task } from "./task.entity.js";
import { TaskAssignment } from "./task-assignment.entity.js";

@Entity({ name: "subtasks" })
export class Subtask {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "task_id", type: "char", length: 36 })
  taskId!: string;

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task!: Task;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "boolean", default: false })
  completed!: boolean;

  @Column({
    name: "time_estimate",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  timeEstimate?: string;

  @OneToMany(() => TaskAssignment, (assignment) => assignment.subtask, {
    cascade: true,
  })
  assignments!: TaskAssignment[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
