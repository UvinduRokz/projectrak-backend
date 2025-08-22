import { Expose } from "class-transformer";
import { UserResponseDto } from "../../../shared/dtos/user-response.dto.js";
import type { EmployeeResponseDto } from "@/shared/dtos/employee-response.dto.js";

export class AuthResponseDto {
  @Expose({ name: "accessToken" })
  access_token!: string;

  @Expose({ name: "user" })
  user!: UserResponseDto | EmployeeResponseDto;
}
