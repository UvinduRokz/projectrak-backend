import { Expose } from "class-transformer";
import { IsUUID } from "class-validator";

export class CreatePrmDto {
  @Expose({ name: "company_id" })
  @IsUUID()
  companyId!: string;
}
