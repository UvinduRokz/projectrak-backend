import { Expose } from "class-transformer";

export class ProjectOverviewDto {
  @Expose({ name: "projectId" })
  project_id!: string;

  @Expose({ name: "versions" })
  versions!: number;

  @Expose({ name: "tasks" })
  tasks!: number;

  @Expose({ name: "completedTasks" })
  completed_tasks!: number;

  @Expose({ name: "inProgressTasks" })
  in_progress_tasks!: number;

  @Expose({ name: "pendingTasks" })
  pending_tasks!: number;
}
