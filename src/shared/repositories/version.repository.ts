import { Service, Inject } from "typedi";
import { Repository, DataSource } from "typeorm";
import { ProjectVersion } from "@/shared/entities/project-version.entity.js";

@Service()
export class VersionRepository {
  private readonly repo: Repository<ProjectVersion>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(ProjectVersion);
  }

  findAll(projectId: string) {
    return this.repo.find({ where: { projectId } });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<ProjectVersion>) {
    return this.repo.create(data);
  }

  save(entity: ProjectVersion) {
    return this.repo.save(entity);
  }

  remove(entity: ProjectVersion) {
    return this.repo.remove(entity);
  }
}
