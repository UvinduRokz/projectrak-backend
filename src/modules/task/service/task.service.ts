import { Project } from "@/shared/entities/project.entity.js";
import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { TaskRepository } from "@/shared/repositories/task.repository.js";
import { CreateTaskDto } from "../dtos/create-task.dto.js";
import { UpdateTaskDto } from "../dtos/update-task.dto.js";
import { TaskResponseDto } from "../../../shared/dtos/task-response.dto.js";
import { CategorizedTasksResponseDto } from "../../../shared/dtos/categorized-tasks-response.dto.js";
import { NotFoundError, BadRequestError } from "@/shared/errors/index.js";
import { Task, TaskStatus } from "@/shared/entities/task.entity.js";
import { DataSource, In, EntityManager } from "typeorm";
import { Subtask } from "@/shared/entities/subtask.entity.js";
import { TaskAssignment } from "@/shared/entities/task-assignment.entity.js";
import { Employee } from "@/shared/entities/employee.entity.js";
import { ProjectVersion } from "@/shared/entities/project-version.entity.js";
import { DashboardService } from "@/modules/dashboard/service/dashboard.service.js";

function normalizeAssigneeItem(item: any): string | null {
  if (!item && item !== "") return null;
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    return item?.employeeId ?? item?.employee_id ?? null;
  }
  return null;
}

@Service()
export class TaskService {
  /**
   * Returns tasks grouped by category for a company, including subtasks.
   * Returns: CategorizedTasksResponseDto[]
   */
  async findGroupedByCategory(
    companyId: string
  ): Promise<CategorizedTasksResponseDto[]> {
    const repo = this.ds.getRepository(Project);
    const projects = await repo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.versions", "versions")
      .leftJoinAndSelect("versions.tasks", "tasks")
      .leftJoinAndSelect("tasks.subtasks", "subtasks")
      .where("p.companyId = :companyId", { companyId })
      .getMany();

    const allTasks: Task[] = [];
    for (const project of projects) {
      for (const version of project.versions ?? []) {
        for (const task of version.tasks ?? []) {
          allTasks.push(task);
        }
      }
    }

    const groupedMap: Map<string, TaskResponseDto[]> = new Map();
    for (const task of allTasks) {
      const category = task.category ?? "Uncategorized";
      if (!groupedMap.has(category)) groupedMap.set(category, []);
      groupedMap.get(category)!.push(
        plainToInstance(TaskResponseDto, task, {
          excludeExtraneousValues: true,
        })
      );
    }

    const result: CategorizedTasksResponseDto[] = Array.from(
      groupedMap.entries()
    ).map(([category, tasks]) => ({ category, tasks }));
    return result;
  }
  constructor(
    @Inject(() => TaskRepository)
    private readonly taskRepo: TaskRepository,
    @Inject(() => DataSource) private readonly ds: DataSource,
    @Inject(() => DashboardService)
    private readonly dashboardService: DashboardService
  ) {}

  async findAll(versionId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepo.findAll(versionId);
    return plainToInstance(TaskResponseDto, tasks, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new NotFoundError("task_not_found");
    return plainToInstance(TaskResponseDto, task, {
      excludeExtraneousValues: true,
    });
  }

  async findByEmployee(employeeId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepo.findAssignedToEmployee(employeeId);
    return plainToInstance(TaskResponseDto, tasks, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Public create: accepts either a single CreateTaskDto or an array for bulk.
   * Returns TaskResponseDto for single, or TaskResponseDto[] for bulk.
   */
  async create(
    versionId: string,
    dtoOrArray: CreateTaskDto | CreateTaskDto[]
  ): Promise<TaskResponseDto | TaskResponseDto[]> {
    if (Array.isArray(dtoOrArray)) {
      // bulk create inside one transaction (atomic)
      const createdTasks = await this.ds.transaction(
        async (manager: EntityManager) => {
          const created: Task[] = [];
          for (const dto of dtoOrArray) {
            const t = await this.createWithManager(manager, versionId, dto);
            created.push(t);
          }
          return created;
        }
      );

      // After bulk create, recompute priorities for this version
      try {
        await this.dashboardService.prioritizeTasksForVersion(versionId);
      } catch (err) {
        // don't break flow if priority calc fails; log if you have logger
        // console.warn("priority calculation failed after bulk create", err);
      }

      // reload with relations and map to DTOs
      const repo = this.ds.getRepository(Task);
      const results: TaskResponseDto[] = [];
      for (const t of createdTasks) {
        const full = await repo
          .createQueryBuilder("t")
          .leftJoinAndSelect("t.subtasks", "subtasks")
          .leftJoinAndSelect("subtasks.assignments", "assignments")
          .where("t.id = :id", { id: t.id })
          .getOne();
        if (!full) throw new NotFoundError("task_not_found_after_create");
        results.push(
          plainToInstance(TaskResponseDto, full, {
            excludeExtraneousValues: true,
          })
        );
      }
      return results;
    }

    // single create (wrap in transaction to reuse same helper)
    const saved = await this.ds.transaction(async (manager: EntityManager) =>
      this.createWithManager(manager, versionId, dtoOrArray as CreateTaskDto)
    );

    // After single create, recompute priorities for this version
    try {
      await this.dashboardService.prioritizeTasksForVersion(versionId);
    } catch (err) {
      // console.warn("priority calculation failed after create", err);
    }

    const repo = this.ds.getRepository(Task);
    const full = await repo
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.subtasks", "subtasks")
      .leftJoinAndSelect("subtasks.assignments", "assignments")
      .where("t.id = :id", { id: (saved as Task).id })
      .getOne();

    if (!full) throw new NotFoundError("task_not_found_after_create");
    return plainToInstance(TaskResponseDto, full, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Internal helper used by single and bulk create. Uses provided manager to run DB ops.
   */
  private async createWithManager(
    manager: EntityManager,
    versionId: string,
    dto: CreateTaskDto
  ): Promise<Task> {
    const versionRepo = manager.getRepository(ProjectVersion);
    const employeeRepo = manager.getRepository(Employee);
    const taskRepo = manager.getRepository(Task);
    const subtaskRepo = manager.getRepository(Subtask);

    // ensure the version exists and get companyId
    const version = await versionRepo.findOne({
      where: { id: versionId },
      relations: ["project"],
    });
    if (!version) throw new NotFoundError("project_version_not_found");
    const companyId = (version.project as any)?.companyId;
    if (!companyId) throw new NotFoundError("project_for_version_not_found");

    // collect all assignee ids from subtask-level and task-level assignments
    const allAssigneeIds: string[] = [];
    const subtasksInput = dto.subtasks ?? [];
    if (Array.isArray(subtasksInput)) {
      for (const s of subtasksInput) {
        const subAssigneesRaw: any[] = s?.assignments ?? [];
        if (Array.isArray(subAssigneesRaw)) {
          for (const a of subAssigneesRaw) {
            const normalized = normalizeAssigneeItem(a);
            if (normalized) allAssigneeIds.push(normalized);
          }
        }
      }
    }

    const taskLevelAssigneeRaw: any[] = (dto as any).assignments ?? [];
    if (Array.isArray(taskLevelAssigneeRaw)) {
      for (const a of taskLevelAssigneeRaw) {
        const normalized = normalizeAssigneeItem(a);
        if (normalized) allAssigneeIds.push(normalized);
      }
    }

    const uniqueAssigneeIds = Array.from(new Set(allAssigneeIds)).filter(
      Boolean
    );

    // validate employees exist and belong to that company
    if (uniqueAssigneeIds.length) {
      const found = await employeeRepo.find({
        where: { id: In(uniqueAssigneeIds), companyId },
      });
      if (found.length !== uniqueAssigneeIds.length) {
        const foundIds = new Set(found.map((e: any) => e.id));
        const missing = uniqueAssigneeIds.filter((id) => !foundIds.has(id));
        throw new BadRequestError(
          `assignees_not_found_or_not_in_company: ${missing.join(",")}`
        );
      }
    }

    // Determine remainingTime: default to estimatedTime on create if not provided
    const estimated = (dto as any).estimatedTime ?? null;
    const remaining = (dto as any).remainingTime ?? estimated ?? null;

    // Create task (without nested subtasks/assignments)
    const taskEntity = taskRepo.create({
      projectVersionId: versionId,
      title: dto.title,
      category: (dto as any).category,
      // priority: leave as provided or null; dashboard will recalc
      priority: (dto as any).priority,
      // status must default to pending on create
      status: (dto as any).status ?? TaskStatus.PENDING,
      // progress set to 0 on create
      progress: 0,
      estimatedTime: estimated,
      remainingTime: remaining,
      dueDate: (dto as any).dueDate
        ? new Date((dto as any).dueDate).toISOString().slice(0, 10)
        : null,
      description: (dto as any).description,
    } as Partial<Task>);

    const savedTask = await taskRepo.save(taskEntity);

    // create explicit subtasks and their assignments
    if (Array.isArray(dto.subtasks) && dto.subtasks.length) {
      for (const sDto of dto.subtasks!) {
        const subEntity = subtaskRepo.create({
          taskId: savedTask.id,
          title: sDto.title,
          timeEstimate: sDto.timeEstimate,
          completed: sDto.completed ?? false,
        } as Partial<Subtask>);
        const savedSub = await subtaskRepo.save(subEntity);

        const subAssigneeIds: string[] = (sDto.assignments ?? [])
          .map((a: any) => normalizeAssigneeItem(a))
          .filter(Boolean) as string[];

        if (subAssigneeIds.length) {
          const unique = Array.from(new Set(subAssigneeIds));
          const insertRows = unique.map((employeeId) => ({
            subtaskId: savedSub.id,
            employeeId: String(employeeId),
          }));
          await manager
            .createQueryBuilder()
            .insert()
            .into(TaskAssignment)
            .values(insertRows as any[])
            .execute();
        }
      }
    }

    // task-level assignments -> create a single AUTO subtask and attach assignments
    if (
      Array.isArray((dto as any).assignments) &&
      (dto as any).assignments.length
    ) {
      const placeholder = subtaskRepo.create({
        taskId: savedTask.id,
        title: `AUTO subtask for task ${savedTask.id}`,
        completed: false,
      } as Partial<Subtask>);
      const savedPlaceholder = await subtaskRepo.save(placeholder);

      const unique = Array.from(
        new Set(
          (dto as any).assignments ??
            [].map((a: any) => normalizeAssigneeItem(a)).filter(Boolean)
        )
      ) as string[];

      const insertRows = unique.map((employeeId) => ({
        subtaskId: savedPlaceholder.id,
        employeeId: String(employeeId),
      }));
      await manager
        .createQueryBuilder()
        .insert()
        .into(TaskAssignment)
        .values(insertRows as any[])
        .execute();
    }

    return savedTask;
  }

  /**
   * Single update (keeps existing behavior)
   */
  async update(id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    await this.ds.transaction(async (manager: EntityManager) => {
      await this.updateWithManager(manager, id, dto);
    });

    const repo = this.ds.getRepository(Task);
    const full = await repo
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.subtasks", "subtasks")
      .leftJoinAndSelect("subtasks.assignments", "assignments")
      .where("t.id = :id", { id })
      .getOne();

    if (!full) throw new NotFoundError("task_not_found_after_update");
    return plainToInstance(TaskResponseDto, full, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Bulk update: accepts array of { id, ...UpdateTaskDto }.
   * All updates are performed inside one transaction (atomic).
   * Returns array of TaskResponseDto in the same order as the input.
   */
  async bulkUpdate(
    items: Array<{ id: string } & Partial<UpdateTaskDto>>
  ): Promise<TaskResponseDto[]> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError("payload_must_be_non_empty_array");
    }

    const updatedTasks = await this.ds.transaction(
      async (manager: EntityManager) => {
        const results: Task[] = [];
        for (const it of items) {
          await this.updateWithManager(manager, it.id, it as UpdateTaskDto);
          // push the task id for later fetching
          const taskRepo = manager.getRepository(Task);
          const task = await taskRepo.findOneBy({ id: it.id });
          if (!task) throw new NotFoundError(`task_not_found: ${it.id}`);
          results.push(task);
        }
        return results;
      }
    );

    // reload each updated task with relations
    const repo = this.ds.getRepository(Task);
    const results: TaskResponseDto[] = [];
    for (const t of updatedTasks) {
      const full = await repo
        .createQueryBuilder("t")
        .leftJoinAndSelect("t.subtasks", "subtasks")
        .leftJoinAndSelect("subtasks.assignments", "assignments")
        .where("t.id = :id", { id: t.id })
        .getOne();
      if (!full)
        throw new NotFoundError(`task_not_found_after_update: ${t.id}`);
      results.push(
        plainToInstance(TaskResponseDto, full, {
          excludeExtraneousValues: true,
        })
      );
    }
    return results;
  }

  /**
   * Internal helper to perform update logic using a manager (replace subtasks/assignments when provided).
   * Mirrors the previous transactional update logic.
   *
   * New behaviour:
   * - If dto.subtasks is an array of subtask IDs (strings) or objects of shape { id: "<uuid>" }
   *   AND dto.status is provided as 'completed' (or any status) we treat this as a mark-only update:
   *     - mark those subtask ids completed = true
   *     - recompute and persist task.progress
   *     - set task.status to provided status (if present)
   *     - return
   *
   * - Otherwise we fall back to the existing "replace subtasks" behavior (delete existing subtasks+assignments, recreate).
   */
  private async updateWithManager(
    manager: EntityManager,
    id: string,
    dto: UpdateTaskDto
  ): Promise<void> {
    const taskRepo = manager.getRepository(Task);
    const subtaskRepo = manager.getRepository(Subtask);
    const employeeRepo = manager.getRepository(Employee);
    const versionRepo = manager.getRepository(ProjectVersion);

    // re-fetch to ensure manager-scoped entities
    const task = await taskRepo.findOneBy({ id });
    if (!task) throw new NotFoundError("task_not_found");

    // get companyId via task -> version -> project
    const version = await versionRepo.findOne({
      where: { id: task.projectVersionId },
      relations: ["project"],
    });
    if (!version) throw new NotFoundError("project_version_not_found");
    const companyId = (version.project as any)?.companyId;

    // Detect "mark-only" subtasks payload: array of strings OR array of { id }
    const subtasksPayload = (dto as any).subtasks;
    const isArrayOfIds =
      Array.isArray(subtasksPayload) &&
      subtasksPayload.length > 0 &&
      subtasksPayload.every(
        (it: any) =>
          typeof it === "string" ||
          (it &&
            typeof it === "object" &&
            (it.id || it.subtaskId) &&
            Object.keys(it).length <= 2)
      );

    // If payload is mark-only (ids) and status provided (e.g., completed), mark those subtasks
    if (isArrayOfIds && (dto as any).status) {
      // Extract ids
      const ids: string[] = subtasksPayload
        .map((it: any) => (typeof it === "string" ? it : it.id ?? it.subtaskId))
        .filter(Boolean);

      if (ids.length) {
        // mark subtasks as completed (or respect provided completed flag? user asked only to mark completed)
        // We'll mark completed = true only if status is 'completed', otherwise no-op on subtask completion.
        if ((dto as any).status === TaskStatus.COMPLETED) {
          await manager
            .createQueryBuilder()
            .update(Subtask)
            .set({ completed: true })
            .where("id IN (:...ids)", { ids })
            .execute();
        }

        // recompute progress for this task (using manager queries)
        const rows: Array<{ total: number; completed: number }> =
          await manager.query(
            `SELECT COUNT(*) AS total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed
             FROM subtasks
             WHERE task_id = ?`,
            [task.id]
          );
        const totalsRow = rows[0] || { total: 0, completed: 0 };
        const total = Number(totalsRow.total) || 0;
        const completed = Number(totalsRow.completed) || 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        // persist task.progress and task.status (if provided)
        await manager
          .createQueryBuilder()
          .update(Task)
          .set({
            progress,
            status: (dto as any).status ?? task.status,
          })
          .where("id = :id", { id: task.id })
          .execute();

        return;
      }
    }

    // FALLBACK: previous replace-subtasks behavior
    const mustReplaceSubtasks =
      (dto as any).subtasks != null || (dto as any).assignments != null;
    if (!mustReplaceSubtasks) {
      Object.assign(task, dto as any);
      await taskRepo.save(task);
      return;
    }

    // collect assignee ids from new payload
    const allAssigneeIds: string[] = [];
    const subtasksInput: any[] = (dto as any).subtasks ?? [];
    for (const s of subtasksInput) {
      const subAssignees: string[] = (s.assignments ?? [])
        .map((a: any) => normalizeAssigneeItem(a))
        .filter(Boolean) as string[];
      for (const idd of subAssignees) allAssigneeIds.push(idd);
    }

    const taskLevelAssigneesRaw: any[] = (dto as any).assignments ?? [];
    for (const idd of taskLevelAssigneesRaw) {
      const uid = normalizeAssigneeItem(idd);
      if (uid) allAssigneeIds.push(uid);
    }

    const uniqueAssigneeIds = Array.from(new Set(allAssigneeIds)).filter(
      Boolean
    );

    if (uniqueAssigneeIds.length) {
      const found = await employeeRepo.find({
        where: { id: In(uniqueAssigneeIds), companyId },
      });
      if (found.length !== uniqueAssigneeIds.length) {
        const foundIds = new Set(found.map((e: any) => e.id));
        const missing = uniqueAssigneeIds.filter((i) => !foundIds.has(i));
        throw new BadRequestError(
          `assignees_not_found_or_not_in_company: ${missing.join(",")}`
        );
      }
    }

    // Delete existing assignments & subtasks for this task (replace strategy)
    const existingSubtasks: Subtask[] = await subtaskRepo.find({
      where: { taskId: task.id },
    });
    const existingSubIds = existingSubtasks.map((s) => s.id);
    if (existingSubIds.length) {
      await manager
        .createQueryBuilder()
        .delete()
        .from(TaskAssignment)
        .where("subtask_id IN (:...ids)", { ids: existingSubIds })
        .execute();
      await manager
        .createQueryBuilder()
        .delete()
        .from(Subtask)
        .where("task_id = :taskId", { taskId: task.id })
        .execute();
    }

    // recreate subtasks & assignments from payload
    if (Array.isArray((dto as any).subtasks) && (dto as any).subtasks.length) {
      for (const sDto of (dto as any).subtasks) {
        const subEntity = subtaskRepo.create({
          taskId: task.id,
          title: sDto.title,
          timeEstimate: sDto.timeEstimate,
          completed: sDto.completed ?? false,
        } as Partial<Subtask>);
        const savedSub = await subtaskRepo.save(subEntity);

        const subAssigneeIds: string[] = (sDto.assignments ?? [])
          .map((a: any) => normalizeAssigneeItem(a))
          .filter(Boolean) as string[];
        if (subAssigneeIds.length) {
          const unique = Array.from(new Set(subAssigneeIds));
          const insertRows = unique.map((employeeId) => ({
            subtaskId: savedSub.id,
            employeeId: String(employeeId),
          }));
          await manager
            .createQueryBuilder()
            .insert()
            .into(TaskAssignment)
            .values(insertRows as any[])
            .execute();
        }
      }
    }

    // if task-level assignments provided, create AUTO placeholder and attach
    if (
      Array.isArray((dto as any).assignments) &&
      (dto as any).assignments.length
    ) {
      const placeholder = subtaskRepo.create({
        taskId: task.id,
        title: `AUTO subtask for task ${task.id}`,
        completed: false,
      } as Partial<Subtask>);
      const savedPlaceholder = await subtaskRepo.save(placeholder);

      const unique = Array.from(
        new Set(
          ((dto as any).assignments ?? [])
            .map((a: any) => normalizeAssigneeItem(a))
            .filter(Boolean)
        )
      ) as string[];
      const insertRows = unique.map((employeeId) => ({
        subtaskId: savedPlaceholder.id,
        employeeId: String(employeeId),
      }));
      await manager
        .createQueryBuilder()
        .insert()
        .into(TaskAssignment)
        .values(insertRows as any[])
        .execute();
    }

    // finally update task fields
    Object.assign(task, dto as any);
    await taskRepo.save(task);
    return;
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new NotFoundError("task_not_found");
    await this.taskRepo.remove(task);
  }
}
