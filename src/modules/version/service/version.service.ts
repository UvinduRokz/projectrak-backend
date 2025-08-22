import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { VersionRepository } from "@/shared/repositories/version.repository.js";
import { CreateVersionDto } from "../dtos/create-version.dto.js";
import { UpdateVersionDto } from "../dtos/update-version.dto.js";
import { VersionResponseDto } from "../../../shared/dtos/version-response.dto.js";
import { NotFoundError } from "@/shared/errors/index.js";
import { ProjectVersion } from "@/shared/entities/project-version.entity.js";

@Service()
export class VersionService {
  constructor(
    @Inject(() => VersionRepository)
    private readonly versionRepo: VersionRepository
  ) {}

  async findAll(projectId: string): Promise<VersionResponseDto[]> {
    const versions = await this.versionRepo.findAll(projectId);
    return plainToInstance(VersionResponseDto, versions, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string): Promise<VersionResponseDto> {
    const version = await this.versionRepo.findById(id);
    if (!version) throw new NotFoundError("version_not_found");
    return plainToInstance(VersionResponseDto, version, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    projectId: string,
    dto: CreateVersionDto
  ): Promise<VersionResponseDto> {
    const entity = this.versionRepo.create({
      projectId,
      ...dto,
    } as Partial<ProjectVersion>);
    const saved = await this.versionRepo.save(entity);
    return plainToInstance(VersionResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, dto: UpdateVersionDto): Promise<VersionResponseDto> {
    const version = await this.versionRepo.findById(id);
    if (!version) throw new NotFoundError("version_not_found");
    Object.assign(version, dto);
    const updated = await this.versionRepo.save(version);
    return plainToInstance(VersionResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const version = await this.versionRepo.findById(id);
    if (!version) throw new NotFoundError("version_not_found");
    await this.versionRepo.remove(version);
  }
}
