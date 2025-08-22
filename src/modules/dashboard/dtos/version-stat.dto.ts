import { Expose } from "class-transformer";

export class VersionStatDto {
  @Expose({ name: "id" })
  id!: string;

  @Expose({ name: "version" })
  version!: string;

  @Expose({ name: "status" })
  status!: string;

  @Expose({ name: "progress" })
  progress!: number;

  @Expose({ name: "tasks" })
  tasks!: number;

  @Expose({ name: "completed" })
  completed!: number;
}
