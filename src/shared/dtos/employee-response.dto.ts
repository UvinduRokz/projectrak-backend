import { Expose } from "class-transformer";

export class EmployeeResponseDto {
  @Expose({ name: "id" })
  id!: string;

  @Expose({ name: "name" })
  name!: string;

  @Expose({ name: "email" })
  email!: string;

  @Expose({ name: "companyId" })
  company_id!: string;
}
