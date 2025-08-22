import { Expose } from "class-transformer";

export class RecentProjectDto {
  @Expose({ name: "id" })
  id!: string;

  @Expose({ name: "name" })
  name!: string;

  @Expose({ name: "description" })
  description?: string;

  @Expose({ name: "latestProgress" })
  latest_progress!: number;

  @Expose({ name: "latestStatus" })
  latest_status!: string;

  @Expose({ name: "teamSize" })
  team_size!: number;

  @Expose({ name: "updatedAt" })
  updated_at!: string;
}
