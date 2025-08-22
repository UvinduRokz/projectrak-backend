import { Service, Inject } from "typedi";
import { Repository, DataSource } from "typeorm";
import { Task } from "@/shared/entities/task.entity.js";

@Service()
export class TaskRepository {
  private readonly repo: Repository<Task>;

  constructor(
    @Inject(() => DataSource)
    private readonly ds: DataSource
  ) {
    this.repo = this.ds.getRepository(Task);
  }

  /**
   * Find tasks for a given project version including subtasks + assignments
   */
  async findAll(versionId: string) {
    return this.repo
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.subtasks", "subtasks")
      .leftJoinAndSelect("subtasks.assignments", "assignments")
      .where("t.projectVersionId = :versionId", { versionId })
      .getMany();
  }

  /**
   * Find one task by id including subtasks + assignments
   */
  async findById(id: string) {
    return this.repo
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.subtasks", "subtasks")
      .leftJoinAndSelect("subtasks.assignments", "assignments")
      .where("t.id = :id", { id })
      .getOne();
  }

  /**
   * Find all tasks where the given employee is assigned to at least one subtask.
   * Returns tasks with subtasks + assignments populated.
   */
  async findAssignedToEmployee(employeeId: string) {
    const rows: Array<{ subtaskId: string; taskId: string }> =
      await this.ds.query(
        `
      SELECT s.id AS subtaskId, s.task_id AS taskId
      FROM subtasks s
      JOIN task_assignments ta ON ta.subtask_id = s.id
      WHERE ta.employee_id = ?
    `,
        [employeeId]
      );

    if (!rows || rows.length === 0) return [];

    const subtaskIds = Array.from(new Set(rows.map((r) => r.subtaskId)));
    const taskIds = Array.from(new Set(rows.map((r) => r.taskId)));
    const qb = this.repo
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.projectVersion", "projectVersion")
      .leftJoinAndSelect("projectVersion.project", "project")
      .leftJoinAndSelect(
        "t.subtasks",
        "subtasks",
        "subtasks.id IN (:...subtaskIds)"
      )
      .leftJoinAndSelect("subtasks.assignments", "assignments")
      .where("t.id IN (:...taskIds)", { taskIds })
      .orderBy("t.createdAt", "DESC")
      .addSelect(["project.id", "project.name"]);

    // getMany returns Task[] with projectVersion.project populated
    const tasks = await qb.setParameter("subtaskIds", subtaskIds).getMany();

    // Attach projectId and projectName to each task (for convenience)
    return tasks.map((task) => ({
      ...task,
      projectId: task.projectVersion?.project?.id,
      projectName: task.projectVersion?.project?.name,
    }));
  }

  create(data: Partial<Task>) {
    return this.repo.create(data);
  }

  save(entity: Task) {
    return this.repo.save(entity);
  }

  remove(entity: Task) {
    return this.repo.remove(entity);
  }
}
