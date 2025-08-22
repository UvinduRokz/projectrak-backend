import { Router } from "express";
import { Container } from "typedi";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { SubtaskService } from "../service/subtask.service.js";
import { CreateSubtaskDto } from "../dtos/create-subtask.dto.js";
import { UpdateSubtaskDto } from "../dtos/update-subtask.dto.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const subtaskRouter = Router();

/**
 * @openapi
 * /tasks/{taskId}/subtasks:
 *   get:
 *     summary: List subtasks for a task
 *     tags: [Subtask]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Array of subtasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubtaskResponseDto'
 */
subtaskRouter.get(
  "/:taskId/subtasks",
  protect(["admin", "employee"]),
  async (req, res, next) => {
    try {
      const service = Container.get(SubtaskService);
      const list = await service.findAll(req.params.taskId!);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /tasks/{taskId}/subtasks:
 *   post:
 *     summary: Create a subtask for a task
 *     tags: [Subtask]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubtaskDto'
 *     responses:
 *       201:
 *         description: Subtask created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubtaskResponseDto'
 */
subtaskRouter.post(
  "/:taskId/subtasks",
  protect("admin"),
  validationPipe(CreateSubtaskDto),
  async (req, res, next) => {
    try {
      const service = Container.get(SubtaskService);
      const dto = await service.create(req.params.taskId!, req.body);
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /subtasks/{id}:
 *   put:
 *     summary: Update a subtask
 *     tags: [Subtask]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subtask ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubtaskDto'
 *     responses:
 *       200:
 *         description: Updated subtask
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubtaskResponseDto'
 */
subtaskRouter.put(
  "/subtasks/:id",
  protect(["admin", "employee"]),
  validationPipe(UpdateSubtaskDto),
  async (req, res, next) => {
    try {
      const service = Container.get(SubtaskService);
      const dto = await service.update(req.params.id!, req.body);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /subtasks/{id}:
 *   delete:
 *     summary: Delete a subtask
 *     tags: [Subtask]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subtask ID
 *     responses:
 *       204:
 *         description: Subtask deleted
 */
subtaskRouter.delete(
  "/subtasks/:id",
  protect("admin"),
  async (req, res, next) => {
    try {
      const service = Container.get(SubtaskService);
      await service.remove(req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);
