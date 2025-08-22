import { Expose } from "class-transformer";
import { IsString, IsEmail } from "class-validator";

export class EmployeeLoginDto {
  @Expose({ name: "email" })
  @IsEmail()
  email!: string;

  @Expose({ name: "passkey" })
  @IsString()
  passkey!: string;
}
