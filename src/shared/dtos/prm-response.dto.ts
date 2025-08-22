import { Expose } from "class-transformer";

export class PrmResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: "companyId" })
  company_id!: string;

  @Expose()
  filename!: string;

  @Expose({ name: "filePath" })
  file_path!: string;

  @Expose({ name: "uploadedBy" })
  uploaded_by!: string;

  @Expose({ name: "uploadedAt" })
  uploaded_at!: Date;
}
