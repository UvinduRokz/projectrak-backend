import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { EmployeeRepository } from "@/shared/repositories/employee.repository.js";
import { CreateEmployeeDto } from "../dtos/create-employee.dto.js";
import { UpdateEmployeeDto } from "../dtos/update-employee.dto.js";
import { EmployeeResponseDto } from "@/shared/dtos/employee-response.dto.js";
import { NotFoundError, BadRequestError } from "@/shared/errors/index.js";

@Service()
export class EmployeeService {
  constructor(
    @Inject(() => EmployeeRepository)
    private readonly employeeRepo: EmployeeRepository
  ) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    // unique email check
    if (await this.employeeRepo.findByEmail(dto.email)) {
      throw new BadRequestError("email_already_taken");
    }

    const entity = this.employeeRepo.create({
      name: dto.name,
      email: dto.email,
      companyId: dto.companyId,
    });

    const saved = await this.employeeRepo.save(entity);
    return plainToInstance(EmployeeResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepo.findAll();
    return plainToInstance(EmployeeResponseDto, employees, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string): Promise<EmployeeResponseDto> {
    const emp = await this.employeeRepo.findById(id);
    if (!emp) throw new NotFoundError("employee_not_found");
    return plainToInstance(EmployeeResponseDto, emp, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    dto: UpdateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    const emp = await this.employeeRepo.findById(id);
    if (!emp) throw new NotFoundError("employee_not_found");

    if (dto.email && dto.email !== emp.email) {
      if (await this.employeeRepo.findByEmail(dto.email)) {
        throw new BadRequestError("email_already_taken");
      }
    }

    Object.assign(emp, {
      name: dto.name ?? emp.name,
      email: dto.email ?? emp.email,
      companyId: dto.companyId ?? emp.companyId,
    });

    const updated = await this.employeeRepo.save(emp);
    return plainToInstance(EmployeeResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const emp = await this.employeeRepo.findById(id);
    if (!emp) throw new NotFoundError("employee_not_found");
    await this.employeeRepo.remove(emp);
  }
}
