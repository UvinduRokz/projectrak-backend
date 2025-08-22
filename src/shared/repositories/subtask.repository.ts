import { Service, Inject } from "typedi";
import { Repository, DataSource } from "typeorm";
import { Subtask } from "@/shared/entities/subtask.entity.js";

@Service()
export class SubtaskRepository {
  private readonly repo: Repository<Subtask>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(Subtask);
  }
  findAll(taskId: string) {
    return this.repo.find({ where: { taskId } });
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<Subtask>) {
    return this.repo.create(data);
  }

  save(entity: Subtask) {
    return this.repo.save(entity);
  }

  remove(entity: Subtask) {
    return this.repo.remove(entity);
  }
}
