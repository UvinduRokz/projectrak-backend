import { Expose } from "class-transformer";
import { VersionStatus } from "@/shared/entities/project-version.entity.js";

export class VersionResponseDto {
  @Expose()
  id!: string;

  @Expose()
  version!: string;

  @Expose()
  status!: VersionStatus;

  @Expose()
  progress!: number;

  @Expose({ name: "projectId" })
  project_id!: string;

  @Expose({ name: "createdAt" })
  created_at!: Date;

  @Expose({ name: "updatedAt" })
  updated_at!: Date;
}
