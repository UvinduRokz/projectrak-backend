import { Expose } from "class-transformer";
import { IsUUID } from "class-validator";

export class CreateAssignmentDto {
  @Expose({ name: "employee_id" })
  @IsUUID()
  employeeId!: string;
}
