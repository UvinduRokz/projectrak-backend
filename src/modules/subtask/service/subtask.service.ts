import { DataSource } from "typeorm";
import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { SubtaskRepository } from "@/shared/repositories/subtask.repository.js";
import { DashboardService } from "@/modules/dashboard/service/dashboard.service.js";
import { CreateSubtaskDto } from "../dtos/create-subtask.dto.js";
import { UpdateSubtaskDto } from "../dtos/update-subtask.dto.js";
import { SubtaskResponseDto } from "@/shared/dtos/subtask-response.dto.js";
import { NotFoundError } from "@/shared/errors/index.js";
import { Subtask } from "@/shared/entities/subtask.entity.js";
import { TaskAssignment } from "@/shared/entities/task-assignment.entity.js";

@Service()
export class SubtaskService {
  constructor(
    @Inject(() => SubtaskRepository)
    private readonly subtaskRepo: SubtaskRepository,
    @Inject(() => DataSource)
    private readonly ds: DataSource,
    @Inject(() => DashboardService)
    private readonly dashboardService: DashboardService
  ) {}

  async findAll(taskId: string): Promise<SubtaskResponseDto[]> {
    const subs = await this.subtaskRepo.findAll(taskId);
    return plainToInstance(SubtaskResponseDto, subs, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    taskId: string,
    dto: CreateSubtaskDto
  ): Promise<SubtaskResponseDto> {
    const entity = this.subtaskRepo.create({
      taskId,
      ...dto,
    } as Partial<Subtask>);
    const saved = await this.subtaskRepo.save(entity);
    return plainToInstance(SubtaskResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  private parseTimeToHours(input?: string | null): number {
    if (!input) return 0;
    const s = input.trim();
    const hhmm = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
    if (hhmm) {
      const a = Number(hhmm[1] || 0);
      const b = Number(hhmm[2] || 0);
      const c = Number(hhmm[3] || 0);
      if (hhmm[3] !== undefined) {
        return a + b / 60 + c / 3600;
      } else {
        return a + b / 60;
      }
    }
    let totalHours = 0;
    const lower = s.toLowerCase();
    const dMatch = lower.match(/([\d.]+)\s*d/);
    if (dMatch) totalHours += Number(dMatch[1]) * 24;
    const hMatch = lower.match(/([\d.]+)\s*h/);
    if (hMatch) totalHours += Number(hMatch[1]);
    const mMatch = lower.match(/([\d.]+)\s*m(?!s)/);
    if (mMatch) totalHours += Number(mMatch[1]) / 60;
    const sMatch = lower.match(/([\d.]+)\s*s/);
    if (sMatch) totalHours += Number(sMatch[1]) / 3600;
    if (totalHours === 0) {
      const numMatch = lower.match(/^[\s]*([\d.]+)/);
      if (numMatch) {
        totalHours = Number(numMatch[1]);
      } else {
        const anyNum = lower.match(/([\d.]+)/);
        totalHours = anyNum ? Number(anyNum[1]) : 0;
      }
    }
    return Number.isFinite(totalHours) ? totalHours : 0;
  }

  private formatHoursToHuman(totalHours: number): string {
    if (!Number.isFinite(totalHours) || totalHours <= 0) return "0h";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  async update(id: string, dto: UpdateSubtaskDto): Promise<SubtaskResponseDto> {
    let shouldRecalculateProgress = false;
    let shouldRecalculateRemaining = false;
    let shouldPrioritizeVersion = false;
    let affectedTaskId: string | undefined;

    const fullSubtask = await this.ds.transaction(async (manager) => {
      const subRepo = manager.getRepository(Subtask);
      const taRepo = manager.getRepository(TaskAssignment);
      const sub = await subRepo.findOne({ where: { id } });
      if (!sub) throw new NotFoundError("subtask_not_found");
      const originalCompleted = sub.completed;
      const originalTimeEstimate = sub.timeEstimate;
      if (dto.title !== undefined) sub.title = dto.title;
      if (dto.completed !== undefined) sub.completed = dto.completed;
      if (dto.timeEstimate !== undefined) sub.timeEstimate = dto.timeEstimate;
      affectedTaskId = sub.taskId;
      if (dto.completed !== undefined && dto.completed !== originalCompleted) {
        shouldRecalculateProgress = true;
        shouldRecalculateRemaining = true;
      }
      if (
        dto.timeEstimate !== undefined &&
        dto.timeEstimate !== originalTimeEstimate
      ) {
        shouldPrioritizeVersion = true;
        shouldRecalculateRemaining = true;
      }
      if (dto.assignments !== undefined) {
        const desiredEmployeeIds = dto.assignments.map((a) => a.employeeId);
        const existingAssigns = await taRepo.find({
          where: { subtaskId: id },
        });
        const existingEmployeeIds = existingAssigns.map((a) => a.employeeId);
        const toAdd = desiredEmployeeIds.filter(
          (empId) => !existingEmployeeIds.includes(empId)
        );
        const toRemove = existingAssigns.filter(
          (a) => !desiredEmployeeIds.includes(a.employeeId)
        );
        for (const employeeId of toAdd) {
          const newAssign = taRepo.create({
            subtaskId: id,
            employeeId,
          });
          await taRepo.save(newAssign);
        }
        for (const rem of toRemove) {
          await taRepo.remove(rem);
        }
      }
      const saved = await subRepo.save(sub);
      const full = await subRepo.findOne({
        where: { id: saved.id },
        relations: ["assignments"],
      });
      return full!;
    });

    if (shouldRecalculateProgress && affectedTaskId) {
      try {
        await this.dashboardService.evaluateTaskProgress(affectedTaskId);
      } catch (err) {
        console.error(
          `Failed to recompute progress for task ${affectedTaskId}:`,
          err
        );
      }
    }

    // Always recalculate remaining/estimated time if completed or timeEstimate changed
    if (shouldRecalculateRemaining && affectedTaskId) {
      try {
        const rows: Array<{ project_version_id?: string }> =
          await this.ds.query(
            `SELECT project_version_id FROM tasks WHERE id = ?`,
            [affectedTaskId]
          );
        const projectVersionId = rows?.[0]?.project_version_id;
        try {
          const subs: Array<{
            time_estimate?: string | null;
            completed?: number | null;
          }> = await this.ds.query(
            `SELECT time_estimate, completed FROM subtasks WHERE task_id = ?`,
            [affectedTaskId]
          );
          const totalHours = subs.reduce((acc, r) => {
            return acc + this.parseTimeToHours(r.time_estimate ?? null);
          }, 0);
          const remainingHours = subs.reduce((acc, r) => {
            const isCompleted = !!r.completed;
            return (
              acc +
              (isCompleted ? 0 : this.parseTimeToHours(r.time_estimate ?? null))
            );
          }, 0);
          const formattedEstimated = this.formatHoursToHuman(totalHours);
          const formattedRemaining = this.formatHoursToHuman(remainingHours);
          await this.ds.query(
            `UPDATE tasks SET estimated_time = ?, remaining_time = ? WHERE id = ?`,
            [formattedEstimated, formattedRemaining, affectedTaskId]
          );
        } catch (estimateErr) {
          console.error(
            `Failed to recalc/persist estimated_time/remaining_time for task ${affectedTaskId}:`,
            estimateErr
          );
        }
        if (projectVersionId) {
          try {
            await this.dashboardService.prioritizeTasksForVersion(
              projectVersionId
            );
          } catch (err) {
            console.error(
              `Failed to prioritize tasks for version (task: ${affectedTaskId}):`,
              err
            );
          }
        }
      } catch (err) {
        console.error(
          `Failed to prioritize tasks for version (task: ${affectedTaskId}):`,
          err
        );
      }
    }

    return plainToInstance(SubtaskResponseDto, fullSubtask, {
      excludeExtraneousValues: true,
    });
  }

  async remove(id: string): Promise<void> {
    const sub = await this.subtaskRepo.findById(id);
    if (!sub) throw new NotFoundError("subtask_not_found");
    const affectedTaskId = sub.taskId;
    await this.ds.transaction(async (manager) => {
      const repo = manager.getRepository(Subtask);
      const target = await repo.findOne({ where: { id } });
      if (!target) throw new NotFoundError("subtask_not_found");
      await repo.remove(target);
    });
    try {
      await this.dashboardService.evaluateTaskProgress(affectedTaskId);
    } catch (err) {
      console.error(
        `Failed to recompute progress for task ${affectedTaskId}:`,
        err
      );
    }
    try {
      const rows: Array<{ project_version_id?: string }> = await this.ds.query(
        `SELECT project_version_id FROM tasks WHERE id = ?`,
        [affectedTaskId]
      );
      const projectVersionId = rows?.[0]?.project_version_id;
      try {
        const subs: Array<{
          time_estimate?: string | null;
          completed?: number | null;
        }> = await this.ds.query(
          `SELECT time_estimate, completed FROM subtasks WHERE task_id = ?`,
          [affectedTaskId]
        );
        const totalHours = subs.reduce((acc, r) => {
          return acc + this.parseTimeToHours(r.time_estimate ?? null);
        }, 0);
        const remainingHours = subs.reduce((acc, r) => {
          const isCompleted = !!r.completed;
          return (
            acc +
            (isCompleted ? 0 : this.parseTimeToHours(r.time_estimate ?? null))
          );
        }, 0);
        const formattedEstimated = this.formatHoursToHuman(totalHours);
        const formattedRemaining = this.formatHoursToHuman(remainingHours);
        await this.ds.query(
          `UPDATE tasks SET estimated_time = ?, remaining_time = ? WHERE id = ?`,
          [formattedEstimated, formattedRemaining, affectedTaskId]
        );
      } catch (estimateErr) {
        console.error(
          `Failed to recalc/persist estimated_time/remaining_time for task ${affectedTaskId}:`,
          estimateErr
        );
      }
      if (projectVersionId) {
        try {
          await this.dashboardService.prioritizeTasksForVersion(
            projectVersionId
          );
        } catch (err) {
          console.error(
            `Failed to prioritize tasks for version (task: ${affectedTaskId}):`,
            err
          );
        }
      }
    } catch (err) {
      console.error(
        `Failed to fetch project version for task ${affectedTaskId}:`,
        err
      );
    }
  }
}
