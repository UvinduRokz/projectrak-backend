import { Expose } from "class-transformer";

export class DashboardOverviewDto {
  @Expose({ name: "totalCompanies" })
  total_companies!: number;

  @Expose({ name: "totalProjects" })
  total_projects!: number;

  @Expose({ name: "totalVersions" })
  total_versions!: number;

  @Expose({ name: "totalTasks" })
  total_tasks!: number;

  @Expose({ name: "completedTasks" })
  completed_tasks!: number;

  @Expose({ name: "pendingTasks" })
  pending_tasks!: number;
}
