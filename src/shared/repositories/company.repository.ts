import { Service, Inject } from "typedi";
import { EntityManager } from "typeorm";
import { Repository, DataSource } from "typeorm";
import { Company } from "@/shared/entities/company.entity.js";

@Service()
export class CompanyRepository {
  private readonly repo: Repository<Company>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(Company);
  }

  findAll(manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Company) : this.repo;
    return repo.find();
  }

  findOneById(id: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Company) : this.repo;
    return repo.findOneBy({ id });
  }

  findOneByName(name: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Company) : this.repo;
    return repo.findOneBy({ name });
  }

  findById(id: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Company) : this.repo;
    return repo.findOne({ where: { id } });
  }

  create(data: Partial<Company>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Company) : this.repo;
    return repo.create(data);
  }

  save(entity: Company, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Company) : this.repo;
    return repo.save(entity);
  }

  remove(entity: Company, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Company) : this.repo;
    return repo.remove(entity);
  }
}
