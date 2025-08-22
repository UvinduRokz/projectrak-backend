import { Service, Inject } from "typedi";
import { EntityManager } from "typeorm";
import { instanceToPlain, plainToInstance } from "class-transformer";
import jwt from "jsonwebtoken";

import { UserRepository } from "@/shared/repositories/user.repository.js";
import { CompanyRepository } from "@/shared/repositories/company.repository.js";
import { CompanyService } from "@/modules/company/service/company.service.js";
import { EmployeeRepository } from "@/shared/repositories/employee.repository.js";

import { RegisterDto } from "../dtos/register.dto.js";
import { LoginDto } from "../dtos/admin-login.dto.js";
import { EmployeeLoginDto } from "../dtos/employee-login.dto.js";
import { UserResponseDto } from "@/shared/dtos/user-response.dto.js";
import { EmployeeResponseDto } from "@/shared/dtos/employee-response.dto.js";
import { AuthResponseDto } from "../dtos/auth-response.dto.js";
import { UnauthorizedError } from "@/shared/errors/index.js";
import { config } from "@/config/config.module.js";

@Service()
export class AuthService {
  constructor(
    @Inject(() => UserRepository)
    private readonly userRepo: UserRepository,

    @Inject(() => EmployeeRepository)
    private readonly employeeRepo: EmployeeRepository,

    @Inject(() => CompanyRepository)
    private readonly companyRepo: CompanyRepository,

    @Inject(() => CompanyService)
    private readonly companyService: CompanyService
  ) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    const ds = (this.companyRepo as any).ds;
    return await ds.transaction(async (manager: EntityManager) => {
      // Use repository methods with transaction manager
      const company = this.companyRepo.create({
        name: dto.companyName,
        domain: dto.companyDomain,
        passkey: dto.companyPasskey,
      });
      const savedCompany = await this.companyRepo.save(company, manager);

      if (dto.importConfig) {
        await this.companyService.upsertUserImportConfig(
          savedCompany.id,
          dto.importConfig,
          manager
        );

        if (dto.importConfig.usersEndpoint) {
          await this.companyService.syncUsers(savedCompany.id, manager);
        } else if (dto.importConfig.jsonFile) {
          await this.companyService.syncUsersFromJson(
            savedCompany.id,
            dto.importConfig.jsonFile,
            manager
          );
        }
      }

      const user = this.userRepo.create({
        username: dto.username,
        email: dto.email,
        passwordHash: dto.password,
        company: savedCompany,
      });
      const savedUser = await this.userRepo.save(user, manager);

      return instanceToPlain(savedUser) as UserResponseDto;
    });
  }

  async validateUser(username: string, password: string) {
    const user = await this.userRepo.findOneBy({ username });
    if (!user) throw new UnauthorizedError("invalid_credentials");
    const ok = await user.validatePassword(password);
    if (!ok) throw new UnauthorizedError("invalid_credentials");
    return user;
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(dto.username, dto.password);

    const payload = {
      sub: user.id,
      type: "admin",
      companyId: user.companyId,
      username: user.username,
    };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
    const userDto = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
    const authDto = plainToInstance(
      AuthResponseDto,
      { accessToken: token },
      { excludeExtraneousValues: true }
    );
    authDto.user = userDto;
    return authDto;
  }

  async employeeLogin(dto: EmployeeLoginDto): Promise<AuthResponseDto> {
    const employee = await this.employeeRepo.findByEmail(dto.email);
    if (!employee) throw new UnauthorizedError("invalid_credentials");

    const company = await this.companyRepo.findById(employee.companyId);
    if (!company || company.passkey !== dto.passkey) {
      throw new UnauthorizedError("invalid_credentials");
    }

    const payload = {
      sub: employee.id,
      type: "employee",
      companyId: employee.companyId,
      email: employee.email,
    };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
    const employeeDto = plainToInstance(EmployeeResponseDto, employee, {
      excludeExtraneousValues: true,
    });
    const authDto = plainToInstance(
      AuthResponseDto,
      { accessToken: token },
      { excludeExtraneousValues: true }
    );
    authDto.user = employeeDto;
    return authDto;
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedError("user_not_found");
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async employeeMe(employeeId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepo.findById(employeeId);
    if (!employee) throw new UnauthorizedError("employee_not_found");
    return plainToInstance(EmployeeResponseDto, employee, {
      excludeExtraneousValues: true,
    });
  }
}
