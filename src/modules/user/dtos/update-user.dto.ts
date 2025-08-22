import {
  IsOptional,
  IsString,
  IsEmail,
  IsInt,
  MinLength,
} from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsInt()
  @IsOptional()
  roleId?: number;

  @IsString()
  @IsOptional()
  passkey?: string;
}
