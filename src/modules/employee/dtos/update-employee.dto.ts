import { Expose } from "class-transformer";
import { IsString, IsEmail, IsUUID, IsOptional } from "class-validator";

export class UpdateEmployeeDto {
  @Expose({ name: "name" })
  @IsOptional()
  @IsString()
  name?: string;

  @Expose({ name: "email" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Expose({ name: "company_id" })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
