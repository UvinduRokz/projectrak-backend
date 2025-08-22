import { Expose } from "class-transformer";

export class ProjectResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose({ name: "companyId" })
  company_id!: string;

  @Expose({ name: "createdAt" })
  created_at!: string | Date;

  @Expose({ name: "updatedAt" })
  updated_at!: string | Date;

  @Expose()
  status!: string;

  @Expose()
  progress!: number;

  @Expose({ name: "teamSize" })
  team_size!: number;

  @Expose({ name: "dueDate" })
  due_date!: string | Date;

  @Expose()
  versions!: number;

  @Expose()
  tasks!: number;

  @Expose({ name: "completedTasks" })
  completed_tasks!: number;
}
