import { Expose } from "class-transformer";
import { IsString } from "class-validator";

export class LoginDto {
  @Expose({ name: "username" })
  @IsString()
  username!: string;

  @Expose({ name: "password" })
  @IsString()
  password!: string;
}
