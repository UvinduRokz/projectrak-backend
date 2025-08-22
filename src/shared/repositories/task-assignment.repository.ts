import { Service, Inject } from "typedi";
import { Repository, DataSource } from "typeorm";
import { TaskAssignment } from "@/shared/entities/task-assignment.entity.js";

@Service()
export class TaskAssignmentRepository {
  private readonly repo: Repository<TaskAssignment>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(TaskAssignment);
  }

  findAll(subtaskId: string) {
    return this.repo.find({ where: { subtaskId } });
  }

  findOne(subtaskId: string, employeeId: string) {
    return this.repo.findOneBy({ subtaskId, employeeId });
  }

  create(data: Partial<TaskAssignment>) {
    return this.repo.create(data);
  }

  save(entity: TaskAssignment) {
    return this.repo.save(entity);
  }

  remove(entity: TaskAssignment) {
    return this.repo.remove(entity);
  }
}
