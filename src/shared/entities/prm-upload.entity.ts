import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { Company } from "./company.entity.js";
import { User } from "./user.entity.js";

@Entity({ name: "prm_uploads" })
export class PrmUpload {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "company_id", type: "char", length: 36 })
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "company_id" })
  company!: Company;

  @Column({ type: "varchar", length: 255 })
  filename!: string;

  @Column({ name: "file_path", type: "varchar", length: 500 })
  filePath!: string;

  @Column({ name: "uploaded_by", type: "char", length: 36 })
  uploadedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "uploaded_by" })
  user!: User;

  @CreateDateColumn({ name: "uploaded_at", type: "datetime" })
  uploadedAt!: Date;
}
