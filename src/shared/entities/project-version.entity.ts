import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
} from "typeorm";
import { Project } from "./project.entity.js";
import { Task } from "./task.entity.js";

export enum VersionStatus {
  PLANNING = "planning",
  ACTIVE = "active",
  REVIEW = "review",
  COMPLETED = "completed",
}

@Entity({ name: "project_versions" })
@Unique(["projectId", "version"])
export class ProjectVersion {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "project_id", type: "char", length: 36 })
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.versions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @Column({ type: "varchar", length: 20 })
  version!: string;

  @Column({
    type: "enum",
    enum: VersionStatus,
    default: VersionStatus.PLANNING,
  })
  status!: VersionStatus;

  @Column({ type: "int", default: 0 })
  progress!: number;

  @OneToMany(() => Task, (task) => task.projectVersion, { cascade: true })
  tasks!: Task[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
