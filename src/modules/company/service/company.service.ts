import { Service, Inject } from "typedi";
import { EntityManager } from "typeorm";
import { plainToInstance } from "class-transformer";
import { CompanyResponseDto } from "../../../shared/dtos/company-response.dto.js";
import { CompanyRepository } from "@/shared/repositories/company.repository.js";
import { UpdateCompanyDto } from "../dtos/update-company.dto.js";
import { UpsertUserImportConfigDto } from "@/modules/auth/dtos/user-import.dto.js";
import { NotFoundError, BadRequestError } from "@/shared/errors/index.js";
import { EmployeeRepository } from "@/shared/repositories/employee.repository.js";

@Service()
export class CompanyService {
  constructor(
    @Inject(() => CompanyRepository)
    private readonly companyRepo: CompanyRepository,

    @Inject(() => EmployeeRepository)
    private readonly employeeRepo: EmployeeRepository
  ) {}

  async findAll(): Promise<CompanyResponseDto[]> {
    const companies = await this.companyRepo.findAll();
    return plainToInstance(CompanyResponseDto, companies, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string): Promise<CompanyResponseDto> {
    const company = await this.companyRepo.findOneById(id);
    if (!company) throw new NotFoundError("company_not_found");
    return plainToInstance(CompanyResponseDto, company, {
      excludeExtraneousValues: true,
    });
  }

  async upsertUserImportConfig(
    companyId: string,
    cfg: UpsertUserImportConfigDto,
    manager?: EntityManager
  ) {
    const company = await this.companyRepo.findOneById(companyId, manager);
    if (!company) throw new NotFoundError("company_not_found");

    const { usersEndpoint, usersNameKey, usersEmailKey, usersHeadersJson } =
      cfg;

    Object.assign(company, {
      usersEndpoint,
      usersNameKey,
      usersEmailKey,
      usersHeadersJson,
    });

    return this.companyRepo.save(company, manager);
  }

  async syncUsers(companyId: string, manager?: EntityManager) {
    const comp = await this.companyRepo.findOneById(companyId, manager);
    if (!comp || !comp.usersEndpoint) {
      throw new BadRequestError("user_import_not_configured");
    }

    const headers = comp.usersHeadersJson
      ? JSON.parse(comp.usersHeadersJson)
      : {};

    const resp = await fetch(comp.usersEndpoint, { headers });
    const payload = (await resp.json()) as { message: string; data: any[] };

    for (const rec of payload.data) {
      const name = rec[comp.usersNameKey!];
      const email = rec[comp.usersEmailKey!];

      if (!name || !email) continue;

      await this.employeeRepo.save(
        this.employeeRepo.create({ name, email, companyId })
      );
    }
  }

  async syncUsersFromJson(
    companyId: string,
    jsonFile: string,
    manager?: EntityManager
  ) {
    let records: any[];

    try {
      records = JSON.parse(jsonFile);
    } catch (e) {
      throw new BadRequestError("invalid_json_file");
    }

    if (!Array.isArray(records)) {
      throw new BadRequestError("json_file_must_be_array");
    }

    const comp = await this.companyRepo.findOneById(companyId, manager);
    if (!comp) {
      throw new NotFoundError("company_not_found");
    }

    for (const rec of records) {
      const name = rec[comp.usersNameKey!];
      const email = rec[comp.usersEmailKey!];

      if (!name || !email) continue;

      await this.employeeRepo.save(
        this.employeeRepo.create({ name, email, companyId })
      );
    }
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<CompanyResponseDto> {
    const company = await this.companyRepo.findOneById(id);
    if (!company) throw new NotFoundError("company_not_found");
    Object.assign(company, dto);
    const updated = await this.companyRepo.save(company);
    return plainToInstance(CompanyResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const company = await this.companyRepo.findOneById(id);
    if (!company) throw new NotFoundError("company_not_found");
    await this.companyRepo.remove(company);
  }
}
