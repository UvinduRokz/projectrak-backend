import { Expose, Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from "class-validator";
import { CreateAssignmentDto } from "../../assignment/dtos/create-assignment.dto.js";

export class CreateSubtaskDto {
  @Expose()
  @IsString()
  title!: string;

  @Expose({ name: "time_estimate" })
  @IsOptional()
  @IsString()
  timeEstimate!: string;

  @Expose()
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssignmentDto)
  assignments?: CreateAssignmentDto[];
}
