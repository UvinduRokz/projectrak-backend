import { plainToInstance } from "class-transformer";
import { ProjectResponseDto } from "@/shared/dtos/project-response.dto.js";
import { Project } from "@/shared/entities/project.entity.js";
import { TaskStatus } from "@/shared/entities/task.entity.js";

/**
 * Build a camelCase plain object (matching entity property names).
 * class-transformer will map these camelCase keys to the DTO snake_case properties
 * because the DTO uses @Expose({ name: "camelCaseName" }).
 */
export function buildProjectResponsePlain(
  project: Partial<Project>
): Record<string, any> {
  const versionsArray: any[] = (project as any).versions ?? [];
  const versionsList = Array.isArray(versionsArray)
    ? versionsArray.map((v: any) => ({
        id: v?.id ?? null,
        version: v?.version ?? null,
      }))
    : [];

  const versionsCount = versionsList.length;

  let tasksCount = 0;
  let completedTasks = 0;
  const employeeSet = new Set<string>();

  const status =
    (versionsArray[0] && (versionsArray[0].status as string)) ?? "active";

  let progress = 0;
  if (versionsCount > 0) {
    const sumProgress = versionsArray.reduce(
      (acc: number, v: any) => acc + (Number(v?.progress ?? 0) || 0),
      0
    );
    progress = Math.round(sumProgress / versionsCount);
  }

  let earliestDue: string | null = null;

  for (const v of versionsArray) {
    const tasks: any[] = v?.tasks ?? [];
    if (!Array.isArray(tasks)) continue;
    tasksCount += tasks.length;
    for (const t of tasks) {
      if (t?.status === TaskStatus.COMPLETED) completedTasks++;

      const taskLevelAssignments = t?.assignments ?? [];
      if (Array.isArray(taskLevelAssignments)) {
        for (const a of taskLevelAssignments) {
          const id = a?.employeeId ?? a?.employee_id;
          if (id) employeeSet.add(id);
        }
      }

      const subtasks: any[] = t?.subtasks ?? [];
      if (Array.isArray(subtasks)) {
        for (const s of subtasks) {
          const subAssignments = s?.assignments ?? [];
          if (Array.isArray(subAssignments)) {
            for (const a of subAssignments) {
              const id = a?.employeeId ?? a?.employee_id;
              if (id) employeeSet.add(id);
            }
          }
          if (s?.dueDate) {
            const dt = new Date(s.dueDate);
            if (!isNaN(dt.getTime())) {
              const iso = dt.toISOString();
              if (!earliestDue || new Date(iso) < new Date(earliestDue)) {
                earliestDue = iso;
              }
            }
          }
        }
      }

      if (t?.dueDate) {
        const dt = new Date(t.dueDate);
        if (!isNaN(dt.getTime())) {
          const iso = dt.toISOString();
          if (!earliestDue || new Date(iso) < new Date(earliestDue)) {
            earliestDue = iso;
          }
        }
      }
    }
  }

  const teamSize = employeeSet.size;
  const createdAtIso =
    project?.createdAt != null
      ? new Date(project.createdAt).toISOString()
      : new Date().toISOString();
  const updatedAtIso =
    project?.updatedAt != null
      ? new Date(project.updatedAt).toISOString()
      : new Date().toISOString();
  const dueDateFinal = earliestDue ?? createdAtIso;

  return {
    id: project?.id ?? null,
    name: project?.name ?? null,
    description: project?.description ?? null,
    companyId: (project as any)?.companyId ?? null,
    createdAt: createdAtIso,
    updatedAt: updatedAtIso,
    status,
    progress,
    teamSize,
    dueDate: dueDateFinal,
    // <-- now an array of versions (each { id, version })
    versions: versionsList,
    // keep counts you already compute available if useful downstream
    versionsCount,
    tasks: tasksCount,
    completedTasks,
  };
}

/**
 * Convert entity -> camelCase plain -> ProjectResponseDto (snake_case props via @Expose mapping)
 */
export function buildProjectResponseDto(
  project: Partial<Project>
): ProjectResponseDto {
  const plainCamel = buildProjectResponsePlain(project);
  return plainToInstance(ProjectResponseDto, plainCamel, {
    excludeExtraneousValues: true,
  });
}
