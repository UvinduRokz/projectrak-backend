import { Expose } from "class-transformer";

export class EmployeeCountDto {
  @Expose({ name: "count" })
  count!: number;
}
