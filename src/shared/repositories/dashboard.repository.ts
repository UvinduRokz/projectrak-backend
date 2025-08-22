import { Service } from "typedi";
import { DataSource } from "typeorm";

@Service()
export class DashboardRepository {
  constructor(private readonly ds: DataSource) {}

  async getOverview() {
    const totalCompaniesRaw = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("companies", "c")
      .getRawOne<{ count: number }>();

    const totalProjectsRaw = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("projects", "p")
      .getRawOne<{ count: number }>();

    const totalVersionsRaw = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("project_versions", "v")
      .getRawOne<{ count: number }>();

    const totalTasksRaw = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("tasks", "t")
      .getRawOne<{ count: number }>();

    const completedTasksRaw = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("tasks", "t")
      .where("t.status = :status", { status: "completed" })
      .getRawOne<{ count: number }>();

    const pendingTasksRaw = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("tasks", "t")
      .where("t.status = :status", { status: "pending" })
      .getRawOne<{ count: number }>();

    return {
      totalCompanies: Number(totalCompaniesRaw?.count) || 0,
      totalProjects: Number(totalProjectsRaw?.count) || 0,
      totalVersions: Number(totalVersionsRaw?.count) || 0,
      totalTasks: Number(totalTasksRaw?.count) || 0,
      completedTasks: Number(completedTasksRaw?.count) || 0,
      pendingTasks: Number(pendingTasksRaw?.count) || 0,
    };
  }

  // FIXED: compute assigned and completed subtasks correctly
  async getEmployeeProgress(employeeId: string) {
    // assigned subtasks: count rows in task_assignments for employee
    const assigned = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("task_assignments", "ta")
      .where("ta.employee_id = :employeeId", { employeeId })
      .getRawOne<{ count: number }>();

    // completed subtasks: join task_assignments -> subtasks and count where subtask.completed = true
    const completed = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("task_assignments", "ta")
      .innerJoin("subtasks", "s", "s.id = ta.subtask_id")
      .where("ta.employee_id = :employeeId AND s.completed = true", {
        employeeId,
      })
      .getRawOne<{ count: number }>();

    const assignedCount = Number(assigned?.count) || 0;
    const completedCount = Number(completed?.count) || 0;
    const rate = assignedCount
      ? Math.round((completedCount / assignedCount) * 100)
      : 0;

    return {
      employeeId,
      assignedSubtasks: assignedCount,
      completedSubtasks: completedCount,
      completionRate: rate,
    };
  }

  async getProjectOverview(projectId: string) {
    const versions = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("project_versions", "v")
      .where("v.project_id = :projectId", { projectId })
      .getRawOne<{ count: number }>();

    const tasks = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("tasks", "t")
      .innerJoin("project_versions", "v", "v.id = t.project_version_id")
      .where("v.project_id = :projectId", { projectId })
      .getRawOne<{ count: number }>();

    const completed = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("tasks", "t")
      .innerJoin("project_versions", "v", "v.id = t.project_version_id")
      .where("v.project_id = :projectId AND t.status = :status", {
        projectId,
        status: "completed",
      })
      .getRawOne<{ count: number }>();

    const inProgress = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("tasks", "t")
      .innerJoin("project_versions", "v", "v.id = t.project_version_id")
      .where("v.project_id = :projectId AND t.status = :status", {
        projectId,
        status: "in_progress",
      })
      .getRawOne<{ count: number }>();

    const pending = await this.ds
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("tasks", "t")
      .innerJoin("project_versions", "v", "v.id = t.project_version_id")
      .where("v.project_id = :projectId AND t.status = :status", {
        projectId,
        status: "pending",
      })
      .getRawOne<{ count: number }>();

    return {
      projectId,
      versions: Number(versions?.count) || 0,
      tasks: Number(tasks?.count) || 0,
      completedTasks: Number(completed?.count) || 0,
      inProgressTasks: Number(inProgress?.count) || 0,
      pendingTasks: Number(pending?.count) || 0,
    };
  }

  async getRecentProjects(limit = 5) {
    const sql = `
    SELECT
      p.id,
      p.name,
      p.description,
      COALESCE(latest.progress, 0) AS "latestProgress",
      COALESCE(latest.status, '') AS "latestStatus",
      COALESCE(team.team_size, 0) AS "teamSize",
      p.updated_at AS "updatedAt"
    FROM projects p
    LEFT JOIN (
      SELECT pv.project_id, pv.progress, pv.status
      FROM project_versions pv
      WHERE pv.created_at = (
        SELECT MAX(pv2.created_at) FROM project_versions pv2 WHERE pv2.project_id = pv.project_id
      )
    ) latest ON latest.project_id = p.id
    LEFT JOIN (
      SELECT v.project_id, COUNT(DISTINCT ta.employee_id) AS team_size
      FROM project_versions v
      LEFT JOIN tasks t ON t.project_version_id = v.id
      LEFT JOIN subtasks s ON s.task_id = t.id
      LEFT JOIN task_assignments ta ON ta.subtask_id = s.id
      GROUP BY v.project_id
    ) team ON team.project_id = p.id
    ORDER BY p.updated_at DESC
    LIMIT ?
  `;
    const rows = await this.ds.query(sql, [limit]);

    // rows already have camelCase keys due to SQL aliases above
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      latestProgress: Number(r.latestProgress) || 0,
      latestStatus: r.latestStatus || "",
      teamSize: Number(r.teamSize) || 0,
      updatedAt: r.updatedAt,
    }));
  }

  async getProjectVersionsStats(projectId: string) {
    const qb = this.ds.createQueryBuilder();
    const rows = await qb
      .select("v.id", "version_id")
      .addSelect("v.version", "version")
      .addSelect("v.status", "status")
      .addSelect("v.progress", "progress")
      .addSelect("COUNT(t.id)", "task_count")
      .addSelect(
        "SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END)",
        "completed_count"
      )
      .from("project_versions", "v")
      .leftJoin("tasks", "t", "t.project_version_id = v.id")
      .where("v.project_id = :projectId", { projectId })
      .groupBy("v.id, v.version, v.status, v.progress")
      .orderBy("v.created_at", "DESC")
      .getRawMany();

    return rows.map((r: any) => ({
      id: r.version_id,
      version: r.version,
      status: r.status,
      progress: Number(r.progress) || 0,
      tasks: Number(r.task_count) || 0,
      completed: Number(r.completed_count) || 0,
    }));
  }

  // NEW: task distribution by category (global or per project)
  async getTaskDistribution(projectId?: string) {
    if (projectId) {
      const sql = `
        SELECT t.category as category, COUNT(*) as count
        FROM tasks t
        INNER JOIN project_versions v ON v.id = t.project_version_id
        WHERE v.project_id = ?
        GROUP BY t.category
      `;
      const rows = await this.ds.query(sql, [projectId]);
      return rows.map((r: any) => ({
        category: r.category || "uncategorized",
        count: Number(r.count),
      }));
    } else {
      const sql = `
        SELECT COALESCE(t.category,'uncategorized') as category, COUNT(*) as count
        FROM tasks t
        GROUP BY COALESCE(t.category,'uncategorized')
      `;
      const rows = await this.ds.query(sql);
      return rows.map((r: any) => ({
        category: r.category,
        count: Number(r.count),
      }));
    }
  }

  // NEW: employee count (global or by company)
  async getEmployeeCount(companyId?: string) {
    if (companyId) {
      const row = await this.ds
        .createQueryBuilder()
        .select("COUNT(*)", "count")
        .from("employees", "e")
        .where("e.company_id = :companyId", { companyId })
        .getRawOne<{ count: number }>();
      return { count: Number(row?.count) || 0 };
    } else {
      const row = await this.ds
        .createQueryBuilder()
        .select("COUNT(*)", "count")
        .from("employees", "e")
        .getRawOne<{ count: number }>();
      return { count: Number(row?.count) || 0 };
    }
  }

  /**
   * Recompute progress (0-100) for a single task based on its subtasks and persist to DB.
   * Returns the new progress value.
   */
  async updateTaskProgress(taskId: string): Promise<number> {
    // count total and completed subtasks for the given task
    const rows: Array<{ total: number; completed: number }> =
      await this.ds.query(
        `SELECT COUNT(*) AS total,
              SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed
       FROM subtasks
       WHERE task_id = ?`,
        [taskId]
      );

    const totalsRow = rows[0] || { total: 0, completed: 0 };
    const total = Number(totalsRow.total) || 0;
    const completed = Number(totalsRow.completed) || 0;

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // persist task progress
    await this.ds.query(`UPDATE tasks SET progress = ? WHERE id = ?`, [
      progress,
      taskId,
    ]);

    // fetch project_version_id for the task
    const versionRow = await this.ds.query(
      `SELECT project_version_id FROM tasks WHERE id = ?`,
      [taskId]
    );
    const projectVersionId = versionRow[0]?.project_version_id;

    if (projectVersionId) {
      // fetch all tasks for this version and calculate average progress
      const avgRow = await this.ds.query(
        `SELECT AVG(progress) AS avgProgress FROM tasks WHERE project_version_id = ?`,
        [projectVersionId]
      );
      const avgProgress = Math.round(Number(avgRow[0]?.avgProgress) || 0);
      // persist version progress
      await this.ds.query(
        `UPDATE project_versions SET progress = ? WHERE id = ?`,
        [avgProgress, projectVersionId]
      );
    }

    return progress;
  }

  /**
   * For a given projectVersionId: order tasks by remaining_time (descending)
   * and set their priority using percentiles:
   *  - percentile >= 90  => high
   *  - percentile > 60 && < 90 => medium
   *  - percentile <= 60 => low
   *
   * Note: remaining_time is stored as a string; this function attempts to parse
   * common formats (e.g. "2d 3h", "3h 30m", "2.5", "03:30" etc). If not parseable,
   * it's treated as 0.
   */
  async setTaskPrioritiesForVersion(projectVersionId: string): Promise<void> {
    // fetch tasks and their remaining_time
    const tasks: Array<{ id: string; remainingTime?: string | null }> =
      await this.ds.query(
        `SELECT id, remaining_time AS remainingTime FROM tasks WHERE project_version_id = ?`,
        [projectVersionId]
      );

    // helper to parse remainingTime into a numeric value (hours)
    const parseRemainingToHours = (input?: string | null): number => {
      if (!input) return 0;
      const s = input.trim();

      // hh:mm or mm:ss
      const hhmm = s.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
      if (hhmm) {
        const a = Number(hhmm[1] || 0);
        const b = Number(hhmm[2] || 0);
        const c = Number(hhmm[3] || 0);
        // assume format is H:M(:S) or M:S - if there are three captures treat as H:M:S
        if (hhmm[3] !== undefined) {
          return a + b / 60 + c / 3600; // H:M:S -> hours
        } else {
          // if first part looks large treat as hours, otherwise treat as hours:minutes
          return a + b / 60;
        }
      }

      // parse tokens like "2d 3h 30m", "3h30m", "45m", "2d", "2.5" (assume hours if plain number)
      let totalHours = 0;
      const lower = s.toLowerCase();

      // days
      const dMatch = lower.match(/([\d.]+)\s*d/);
      if (dMatch) totalHours += Number(dMatch[1]) * 24;

      // hours
      const hMatch = lower.match(/([\d.]+)\s*h/);
      if (hMatch) totalHours += Number(hMatch[1]);

      // minutes
      const mMatch = lower.match(/([\d.]+)\s*m(?!s)/); // avoid matching "ms"
      if (mMatch) totalHours += Number(mMatch[1]) / 60;

      // seconds
      const sMatch = lower.match(/([\d.]+)\s*s/);
      if (sMatch) totalHours += Number(sMatch[1]) / 3600;

      // if no unit tokens matched, try to parse plain number
      if (totalHours === 0) {
        const numMatch = lower.match(/^[\s]*([\d.]+)/);
        if (numMatch) {
          // assume plain number is hours
          totalHours = Number(numMatch[1]);
        } else {
          // as last resort check for any number inside the string
          const anyNum = lower.match(/([\d.]+)/);
          totalHours = anyNum ? Number(anyNum[1]) : 0;
        }
      }

      return Number.isFinite(totalHours) ? totalHours : 0;
    };

    const normalized = tasks.map((t) => ({
      id: t.id,
      hours: parseRemainingToHours(t.remainingTime || null),
    }));

    // sort descending by hours
    normalized.sort((a, b) => b.hours - a.hours);

    const n = normalized.length;
    if (n === 0) return;

    // compute percentile and assign priority
    const updates: Array<{ id: string; priority: string }> = [];
    for (let i = 0; i < n; i++) {
      const item = normalized[i];
      if (item) {
        // percentile formula: ((n - index) / n) * 100
        const percentile = ((n - i) / n) * 100;
        let priority = "low";
        if (percentile >= 90) priority = "high";
        else if (percentile > 60 && percentile < 90) priority = "medium";
        else priority = "low";
        updates.push({ id: item.id, priority });
      }
    }

    // persist in a transaction
    await this.ds.transaction(async (manager) => {
      for (const u of updates) {
        await manager.query(`UPDATE tasks SET priority = ? WHERE id = ?`, [
          u.priority,
          u.id,
        ]);
      }
    });
  }
}
