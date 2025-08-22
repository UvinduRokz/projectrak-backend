import { Service, Inject } from "typedi";
import { EntityManager } from "typeorm";
import { Repository, DataSource } from "typeorm";
import { Employee } from "@/shared/entities/employee.entity.js";

@Service()
export class EmployeeRepository {
  private readonly repo: Repository<Employee>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(Employee);
  }

  findById(id: string, manager?: EntityManager): Promise<Employee | null> {
    const repo = manager ? manager.getRepository(Employee) : this.repo;
    return repo.findOneBy({ id });
  }

  findByEmail(
    email: string,
    manager?: EntityManager
  ): Promise<Employee | null> {
    const repo = manager ? manager.getRepository(Employee) : this.repo;
    return repo.findOneBy({ email });
  }

  async findAll(
    companyId?: string,
    manager?: EntityManager
  ): Promise<Employee[]> {
    const repo = manager ? manager.getRepository(Employee) : this.repo;
    if (companyId) {
      return repo.find({ where: { companyId } });
    }
    return repo.find();
  }

  create(data: Partial<Employee>, manager?: EntityManager): Employee {
    const repo = manager ? manager.getRepository(Employee) : this.repo;
    return repo.create(data);
  }

  save(entity: Employee, manager?: EntityManager): Promise<Employee> {
    const repo = manager ? manager.getRepository(Employee) : this.repo;
    return repo.save(entity);
  }

  remove(entity: Employee, manager?: EntityManager): Promise<Employee> {
    const repo = manager ? manager.getRepository(Employee) : this.repo;
    return repo.remove(entity);
  }

  deleteById(id: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(Employee) : this.repo;
    return repo.delete(id).then(() => undefined);
  }
  async saveMany(entities: Employee[], manager?: EntityManager): Promise<Employee[]> {
    const repo = manager ? manager.getRepository(Employee) : this.repo;
    return repo.save(entities);
  }
}
