import { Expose, Type } from "class-transformer";
import {
  IsEmail,
  IsString,
  MinLength,
  Length,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { UpsertUserImportConfigDto } from "./user-import.dto.js";
import { IsCompanyNameUnique } from "@/shared/validators/company.validator.js";

export class RegisterDto {
  @Expose()
  @IsString()
  username!: string;

  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  @MinLength(8)
  password!: string;

  @Expose({ name: "company_name" })
  @IsString()
  @Length(2, 255)
  @IsCompanyNameUnique({ message: "Company name must be unique" })
  companyName!: string;

  @Expose({ name: "company_domain" })
  @IsString()
  @Length(2, 255)
  companyDomain!: string;

  @Expose({ name: "company_passkey" })
  @IsString()
  @Length(4, 100)
  companyPasskey!: string;

  @Expose({ name: "import_config" })
  @Type(() => UpsertUserImportConfigDto)
  @ValidateNested()
  @IsOptional()
  importConfig?: UpsertUserImportConfigDto;
}
