import { Expose } from "class-transformer";
import { IsString, IsOptional } from "class-validator";

export class UpdateProjectDto {
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}
