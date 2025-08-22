import { Expose, Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from "class-validator";
import { CreateAssignmentDto } from "../../assignment/dtos/create-assignment.dto.js";

export class UpdateSubtaskDto {
  @Expose()
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @Expose({ name: "time_estimate" })
  @IsOptional()
  @IsString()
  timeEstimate?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssignmentDto)
  assignments?: CreateAssignmentDto[];
}
