import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Company } from "./company.entity.js";
import { ProjectVersion } from "./project-version.entity.js";

@Entity({ name: "projects" })
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "company_id", type: "char", length: 36 })
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  company!: Company;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @OneToMany(() => ProjectVersion, (version) => version.project, {
    cascade: true,
  })
  versions!: ProjectVersion[];

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
