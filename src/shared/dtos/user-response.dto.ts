import { Expose } from "class-transformer";

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  username!: string;

  @Expose()
  email!: string;

  @Expose({ name: "companyId" })
  company_id!: string;
}
