import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "companies" })
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  domain!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  passkey?: string;

  @Column({
    name: "users_endpoint",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  usersEndpoint?: string;

  @Column({
    name: "users_name_key",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  usersNameKey?: string;

  @Column({
    name: "users_email_key",
    type: "varchar",
    length: 100,
    nullable: true,
  })
  usersEmailKey?: string;

  @Column({ name: "users_headers_json", type: "text", nullable: true })
  usersHeadersJson?: string;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt!: Date;
}
