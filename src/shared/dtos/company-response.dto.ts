import { Expose } from "class-transformer";

export class CompanyResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  domain!: string;

  @Expose({ name: "createdAt" })
  created_at!: Date;

  @Expose({ name: "updatedAt" })
  updated_at!: Date;
}
