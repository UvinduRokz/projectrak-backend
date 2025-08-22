import { Router } from "express";
import { Container } from "typedi";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { TaskService } from "../service/task.service.js";
import { CreateTaskDto } from "../dtos/create-task.dto.js";
import { UpdateTaskDto } from "../dtos/update-task.dto.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const taskRouter = Router();

/**
 * @openapi
 * /versions/{versionId}/tasks:
 *   get:
 *     summary: List all tasks for a version
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Version ID
 *     responses:
 *       200:
 *         description: Array of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskResponseDto'
 */
taskRouter.get(
  "/versions/:versionId/tasks",
  protect(["admin", "employee"]),
  async (req, res, next) => {
    try {
      const service = Container.get(TaskService);
      const list = await service.findAll(req.params.versionId!);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /tasks/me:
 *   get:
 *     summary: List tasks assigned to the current employee
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskResponseDto'
 */
taskRouter.get(
  "/tasks/me",
  protect(["admin", "employee"]),
  async (req, res, next) => {
    try {
      const { userId } = (req.user as any) ?? {};
      const fallbackId = (req.user as any)?.id;
      const uid = userId ?? fallbackId;

      if (!uid) {
        return res.status(401).json({ message: "unauthenticated" });
      }

      const service = Container.get(TaskService);
      const list = await service.findByEmployee(uid);
      res.json(list);
    } catch (err) {
      next(err);
    }
    return;
  }
);

/**
 * @openapi
 * /tasks/by-category:
 *   get:
 *     summary: List tasks grouped by category for a company
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Categorized tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   tasks:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/TaskResponseDto'
 */
taskRouter.get(
  "/tasks/by-category",
  protect(["admin", "employee"]),
  async (req, res, next) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ message: "companyId is required" });
      }
      const service = Container.get(TaskService);
      const grouped = await service.findGroupedByCategory(companyId);
      res.json(grouped);
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update a single task
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskDto'
 *     responses:
 *       200:
 *         description: Updated task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponseDto'
 */
taskRouter.put(
  "/tasks/:id",
  protect(["admin", "employee"]),
  validationPipe(UpdateTaskDto),
  async (req, res, next) => {
    try {
      console.log("ON: Update task");
      const service = Container.get(TaskService);
      const dto = req.body as UpdateTaskDto;
      console.log("DTO:", dto);
      const updated = await service.update(req.params.id!, dto);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /versions/{versionId}/tasks:
 *   post:
 *     summary: Create one or more tasks under a version
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Version ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/CreateTaskDto'
 *     responses:
 *       201:
 *         description: Tasks created
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskResponseDto'
 */
taskRouter.post(
  "/versions/:versionId/tasks",
  protect("admin"),
  validationPipe(CreateTaskDto, { isArray: true }),
  async (req, res, next) => {
    console.log("ON: Create one or more tasks");
    try {
      const service = Container.get(TaskService);
      const payload = Array.isArray(req.body) ? req.body : [req.body];
      const dto = await service.create(req.params.versionId!, payload);
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /tasks:
 *   put:
 *     summary: Bulk update tasks
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/UpdateTaskDto'
 *     responses:
 *       200:
 *         description: Updated tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskResponseDto'
 */
taskRouter.put(
  "/tasks",
  protect("admin"),
  validationPipe(UpdateTaskDto, { isArray: true }),
  async (req, res, next) => {
    try {
      const service = Container.get(TaskService);
      const payload = Array.isArray(req.body) ? req.body : [req.body];
      const dto = await service.bulkUpdate(payload);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponseDto'
 */
taskRouter.get("/tasks/:id", protect("admin"), async (req, res, next) => {
  try {
    const service = Container.get(TaskService);
    const dto = await service.findOne(req.params.id!);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       204:
 *         description: Task deleted
 */
taskRouter.delete("/tasks/:id", protect("admin"), async (req, res, next) => {
  try {
    const service = Container.get(TaskService);
    await service.remove(req.params.id!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
