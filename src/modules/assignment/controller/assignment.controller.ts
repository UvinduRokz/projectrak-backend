import { Router } from "express";
import { Container } from "typedi";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { AssignmentService } from "../service/assignment.service.js";
import { CreateAssignmentDto } from "../dtos/create-assignment.dto.js";

export const assignmentRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Assignment
 *     description: Task assignment endpoints
 *
 * /subtasks/{subtaskId}/assignees:
 *   get:
 *     summary: Get all assignees for a subtask
 *     tags: [Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtaskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Subtask ID
 *     responses:
 *       200:
 *         description: List of assigned users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssignmentResponse'
 */
assignmentRouter.get("/:subtaskId/assignees", async (req, res, next) => {
  try {
    const service = Container.get(AssignmentService);
    const list = await service.list(req.params.subtaskId!);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /subtasks/{subtaskId}/assign:
 *   post:
 *     summary: Assign a user to a subtask
 *     tags: [Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtaskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Subtask ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssignmentDto'
 *     responses:
 *       201:
 *         description: Assignment successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentResponse'
 *       400:
 *         description: User already assigned
 */
assignmentRouter.post(
  "/:subtaskId/assign",
  validationPipe(CreateAssignmentDto),
  async (req, res, next) => {
    try {
      const service = Container.get(AssignmentService);
      const dto = await service.assign(req.params.subtaskId!, req.body);
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /subtasks/{subtaskId}/unassign/{employeeId}:
 *   delete:
 *     summary: Unassign a user from a subtask
 *     tags: [Assignment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subtaskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Subtask ID
 *       - in: path
 *         name: employeeId
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee ID
 *     responses:
 *       204:
 *         description: Unassigned successfully
 *       404:
 *         description: Assignment not found
 */
assignmentRouter.delete(
  "/:subtaskId/unassign/:employeeId",
  async (req, res, next) => {
    try {
      const service = Container.get(AssignmentService);
      await service.unassign(req.params.subtaskId!, req.params.employeeId!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);
