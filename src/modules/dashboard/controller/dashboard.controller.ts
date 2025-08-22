import { Router } from "express";
import { Container } from "typedi";
import { DashboardService } from "../service/dashboard.service.js";

export const dashboardRouter = Router();

/**
 * @openapi
 * /dashboards/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardOverviewDto'
 */
dashboardRouter.get("/overview", async (_req, res, next) => {
  try {
    const service = Container.get(DashboardService);
    const dto = await service.overview();
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /dashboards/user-progress/{employeeId}:
 *   get:
 *     summary: Get user progress for an employee
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeProgressDto'
 */
dashboardRouter.get("/user-progress/:employeeId", async (req, res, next) => {
  try {
    const service = Container.get(DashboardService);
    const dto = await service.employeeProgress(req.params.employeeId!);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /dashboards/project/{projectId}:
 *   get:
 *     summary: Get project overview
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project overview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectOverviewDto'
 */
dashboardRouter.get("/project/:projectId", async (req, res, next) => {
  try {
    const service = Container.get(DashboardService);
    const dto = await service.projectOverview(req.params.projectId!);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /dashboards/recent-projects:
 *   get:
 *     summary: Get recent projects
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of projects
 *     responses:
 *       200:
 *         description: Recent projects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecentProjectsDto'
 */
dashboardRouter.get("/recent-projects", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 5);
    const service = Container.get(DashboardService);
    const dto = await service.recentProjects(limit);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /dashboards/project-versions/{projectId}:
 *   get:
 *     summary: Get versions for a project
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project versions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectVersionsDto'
 */
dashboardRouter.get("/project-versions/:projectId", async (req, res, next) => {
  try {
    const service = Container.get(DashboardService);
    const dto = await service.projectVersions(req.params.projectId!);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /dashboards/task-distribution:
 *   get:
 *     summary: Get task distribution
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Project ID (optional)
 *     responses:
 *       200:
 *         description: Task distribution
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskDistributionDto'
 */
dashboardRouter.get("/task-distribution", async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const service = Container.get(DashboardService);
    const dto = await service.taskDistribution(projectId);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /dashboards/employees/count:
 *   get:
 *     summary: Get employee count
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Company ID (optional)
 *     responses:
 *       200:
 *         description: Employee count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeCountDto'
 */
dashboardRouter.get("/employees/count", async (req, res, next) => {
  try {
    const companyId = req.query.companyId as string | undefined;
    const service = Container.get(DashboardService);
    const dto = await service.employeeCount(companyId);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});
