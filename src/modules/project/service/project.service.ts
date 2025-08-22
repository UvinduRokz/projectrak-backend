import { Service, Inject } from "typedi";
import { ProjectRepository } from "@/shared/repositories/project.repository.js";
import { CreateProjectDto } from "../dtos/create-project.dto.js";
import { UpdateProjectDto } from "../dtos/update-project.dto.js";
import { ProjectResponseDto } from "@/shared/dtos/project-response.dto.js";
import { BadRequestError, NotFoundError } from "@/shared/errors/index.js";
import { Project } from "@/shared/entities/project.entity.js";
import {
  ProjectVersion,
  VersionStatus,
} from "@/shared/entities/project-version.entity.js";
import { CreateVersionDto } from "@/modules/version/dtos/create-version.dto.js";
import { Company } from "@/shared/entities/company.entity.js";
import { DataSource } from "typeorm";
import { buildProjectResponseDto } from "@/shared/mappers/project-response.mapper.js";

@Service()
export class ProjectService {
  constructor(
    @Inject(() => ProjectRepository)
    private readonly projectRepo: ProjectRepository,
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {}

  async findAll(companyId: string): Promise<ProjectResponseDto[]> {
    const repo = this.ds.getRepository(Project);

    const projects = await repo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.company", "company")
      .leftJoinAndSelect("p.versions", "versions")
      .leftJoinAndSelect("versions.tasks", "tasks")
      .leftJoinAndSelect("tasks.subtasks", "subtasks")
      .leftJoinAndSelect("subtasks.assignments", "subtaskAssignments")
      .where("p.companyId = :companyId", { companyId })
      .orderBy("p.updatedAt", "DESC")
      .getMany();

    return projects.map((p) => buildProjectResponseDto(p));
  }

  async findOne(id: string): Promise<ProjectResponseDto> {
    const repo = this.ds.getRepository(Project);
    const project = await repo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.versions", "versions")
      .where("p.id = :id", { id })
      .getOne();

    if (!project) throw new NotFoundError("project_not_found");
    return buildProjectResponseDto(project);
  }

  /**
   * Create project + versions only.
   * Tasks/subtasks/assignments are NOT created here — use Task endpoints instead.
   */
  async create(
    companyId: string,
    dto: CreateProjectDto
  ): Promise<ProjectResponseDto> {
    const createdProject = await this.ds.transaction(async (manager) => {
      const companyRepo = manager.getRepository(Company);
      const projectRepo = manager.getRepository(Project);
      const versionRepo = manager.getRepository(ProjectVersion);

      const company = await companyRepo.findOneBy({ id: companyId });
      if (!company) {
        throw new NotFoundError("company_not_found");
      }

      const versionsRaw =
        dto.versions && dto.versions.length > 0 ? dto.versions : undefined;
      if (versionsRaw && versionsRaw.length > 0) {
        const normalized = versionsRaw.map((v) =>
          (v.version ?? "v1.0").toString().trim().toLowerCase()
        );
        const dupSet = normalized.filter((v, i) => normalized.indexOf(v) !== i);
        if (dupSet.length) {
          throw new BadRequestError(
            `duplicate_version_names: ${Array.from(new Set(dupSet)).join(",")}`
          );
        }
      }

      const versionsInput: CreateVersionDto[] =
        dto.versions && dto.versions.length > 0
          ? dto.versions
          : [
              {
                version: "v1.0",
                status: VersionStatus.PLANNING,
                progress: 0,
                tasks: [],
              },
            ];

      const project = projectRepo.create({
        companyId,
        name: dto.name,
        description: dto.description,
      } as Partial<Project>);
      await projectRepo.save(project);

      // Create versions only. DO NOT create tasks/subtasks/assignments here.
      for (const vDto of versionsInput) {
        const versionValue = vDto.version?.toString().trim() ?? "v1.0";

        const versionEntity = versionRepo.create({
          projectId: project.id,
          version: versionValue,
          status: vDto.status ?? VersionStatus.PLANNING,
          progress: vDto.progress ?? 0,
        } as Partial<ProjectVersion>);

        await versionRepo.save(versionEntity);
      }

      return project;
    });

    // reload with versions (no tasks are created here)
    const projectRepo = this.ds.getRepository(Project);
    const full = await projectRepo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.company", "company")
      .leftJoinAndSelect("p.versions", "versions")
      .where("p.id = :id", { id: createdProject.id })
      .getOne();

    if (!full) throw new NotFoundError("project_not_found_after_create");
    return buildProjectResponseDto(full);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundError("project_not_found");
    Object.assign(project, dto);
    await this.projectRepo.save(project);

    // reload with relations and map
    const repo = this.ds.getRepository(Project);
    const full = await repo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.versions", "versions")
      .where("p.id = :id", { id })
      .getOne();

    if (!full) throw new NotFoundError("project_not_found_after_update");
    return buildProjectResponseDto(full);
  }

  async remove(id: string): Promise<void> {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new NotFoundError("project_not_found");
    await this.projectRepo.remove(project);
  }
}
