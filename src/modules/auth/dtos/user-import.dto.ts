import { Expose } from "class-transformer";
import {
  IsUrl,
  IsString,
  IsOptional,
  IsJSON,
  ValidateIf,
} from "class-validator";

export class UpsertUserImportConfigDto {
  @Expose({ name: "users_endpoint" })
  @ValidateIf((o) => !o.jsonFile)
  @IsString()
  @IsUrl(
    { require_tld: false },
    { message: "usersEndpoint must be a valid URL" }
  )
  usersEndpoint?: string;

  @Expose({ name: "users_name_key" })
  @IsString()
  usersNameKey!: string;

  @Expose({ name: "users_email_key" })
  @IsString()
  usersEmailKey!: string;

  @Expose({ name: "users_headers_json" })
  @IsOptional()
  @IsJSON()
  usersHeadersJson?: string;

  @Expose({ name: "json_file" })
  @ValidateIf((o) => !o.usersEndpoint)
  @IsString()
  @IsJSON()
  jsonFile?: string;
}
