import { Service, Inject } from "typedi";
import { EntityManager } from "typeorm";
import { Repository, DataSource } from "typeorm";
import { User } from "@/shared/entities/user.entity.js";

@Service()
export class UserRepository {
  private readonly repo: Repository<User>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(User);
  }

  findOneBy(conds: Partial<User>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(User) : this.repo;
    const { passwordHash, ...safeConds } = conds as any;
    return repo.findOneBy(safeConds);
  }

  findAll(manager?: EntityManager) {
    const repo = manager ? manager.getRepository(User) : this.repo;
    return repo.find();
  }

  findById(id: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(User) : this.repo;
    return repo.findOneBy({ id });
  }

  create(data: Partial<User>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(User) : this.repo;
    return repo.create(data);
  }

  save(user: User, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(User) : this.repo;
    return repo.save(user);
  }

  remove(user: User, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(User) : this.repo;
    return repo.remove(user);
  }

  deleteById(id: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(User) : this.repo;
    return repo.delete(id);
  }
}
