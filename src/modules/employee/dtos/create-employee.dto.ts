import { Expose } from "class-transformer";
import { IsString, IsEmail, IsUUID } from "class-validator";

export class CreateEmployeeDto {
  @Expose({ name: "name" })
  @IsString()
  name!: string;

  @Expose({ name: "email" })
  @IsEmail()
  email!: string;

  @Expose({ name: "company_id" })
  @IsUUID()
  companyId!: string;
}
