import { Service, Inject } from "typedi";
import { Repository, DataSource } from "typeorm";
import { Project } from "@/shared/entities/project.entity.js";

@Service()
export class ProjectRepository {
  private readonly repo: Repository<Project>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(Project);
  }

  findAll(companyId: string) {
    return this.repo.find({ where: { companyId } });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<Project>) {
    return this.repo.create(data);
  }

  save(entity: Project) {
    return this.repo.save(entity);
  }

  remove(entity: Project) {
    return this.repo.remove(entity);
  }
}
