import { Service, Inject } from "typedi";
import { plainToInstance } from "class-transformer";
import { DashboardRepository } from "@/shared/repositories/dashboard.repository.js";
import { DashboardOverviewDto } from "@/modules/dashboard/dtos/dashboard-overview.dto.js";
import { EmployeeProgressDto } from "@/modules/dashboard/dtos/employee-progress.dto.js";
import { ProjectOverviewDto } from "@/modules/dashboard/dtos/project-overview.dto.js";
import { RecentProjectDto } from "@/modules/dashboard/dtos/recent-project.dto.js";
import { VersionStatDto } from "@/modules/dashboard/dtos/version-stat.dto.js";
import { TaskDistributionDto } from "@/modules/dashboard/dtos/task-distribution.dto.js";
import { EmployeeCountDto } from "@/modules/dashboard/dtos/employee-count.dto.js";

@Service()
export class DashboardService {
  constructor(
    @Inject(() => DashboardRepository)
    private readonly repo: DashboardRepository
  ) {}

  async overview(): Promise<DashboardOverviewDto> {
    const data = await this.repo.getOverview();
    return plainToInstance(DashboardOverviewDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async employeeProgress(employeeId: string): Promise<EmployeeProgressDto> {
    const data = await this.repo.getEmployeeProgress(employeeId);
    return plainToInstance(EmployeeProgressDto, data, {
      excludeExtraneousValues: true,
    });
  }

  async projectOverview(projectId: string): Promise<ProjectOverviewDto> {
    const data = await this.repo.getProjectOverview(projectId);
    return plainToInstance(ProjectOverviewDto, data, {
      excludeExtraneousValues: true,
    });
  }

  // NEW: recent projects
  async recentProjects(limit = 5): Promise<RecentProjectDto[]> {
    const data = await this.repo.getRecentProjects(limit);
    return (data as any[]).map((d) =>
      plainToInstance(RecentProjectDto, d, { excludeExtraneousValues: true })
    );
  }

  async projectVersions(projectId: string): Promise<VersionStatDto[]> {
    const data = await this.repo.getProjectVersionsStats(projectId);
    return (data as any[]).map((d) =>
      plainToInstance(VersionStatDto, d, { excludeExtraneousValues: true })
    );
  }

  async taskDistribution(projectId?: string): Promise<TaskDistributionDto[]> {
    const data = await this.repo.getTaskDistribution(projectId);
    return (data as any[]).map((d) =>
      plainToInstance(TaskDistributionDto, d, { excludeExtraneousValues: true })
    );
  }

  // NEW: employee count
  async employeeCount(companyId?: string): Promise<EmployeeCountDto> {
    const data = await this.repo.getEmployeeCount(companyId);
    return plainToInstance(EmployeeCountDto, data, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Recompute & persist progress for a single task (based on its subtasks).
   * Returns the new progress (0-100).
   */
  async evaluateTaskProgress(taskId: string): Promise<number> {
    return await this.repo.updateTaskProgress(taskId);
  }

  /**
   * Recompute & set task priorities for a single project version (projectVersionId).
   * Ordering is done by remaining_time descending (best-effort parsing of remaining_time strings).
   */
  async prioritizeTasksForVersion(projectVersionId: string): Promise<void> {
    return await this.repo.setTaskPrioritiesForVersion(projectVersionId);
  }
}
