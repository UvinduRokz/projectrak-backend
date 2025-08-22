import { Router } from "express";
import { Container } from "typedi";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { EmployeeService } from "../service/employee.service.js";
import { CreateEmployeeDto } from "../dtos/create-employee.dto.js";
import { UpdateEmployeeDto } from "../dtos/update-employee.dto.js";

export const employeeRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Employee
 *     description: Employee management endpoints
 *
 * /employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployeeDto'
 *     responses:
 *       201:
 *         description: Employee created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponseDto'
 */
// POST /employees
employeeRouter.post(
  "",
  validationPipe(CreateEmployeeDto),
  async (req, res, next) => {
    try {
      const service = Container.get(EmployeeService);
      const dto = await service.create(req.body);
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /employees:
 *   get:
 *     summary: List all employees
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmployeeResponseDto'
 */
// GET /employees
employeeRouter.get("", async (_req, res, next) => {
  try {
    const service = Container.get(EmployeeService);
    const list = await service.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /employees/{id}:
 *   get:
 *     summary: Get a single employee by ID
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponseDto'
 */
// GET /employees/:id
employeeRouter.get("/:id", async (req, res, next) => {
  try {
    const service = Container.get(EmployeeService);
    const dto = await service.findOne(req.params.id!);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /employees/{id}:
 *   put:
 *     summary: Update an employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmployeeDto'
 *     responses:
 *       200:
 *         description: Updated employee object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponseDto'
 */
// PUT /employees/:id
employeeRouter.put(
  "/:id",
  validationPipe(UpdateEmployeeDto),
  async (req, res, next) => {
    try {
      const service = Container.get(EmployeeService);
      const dto = await service.update(req.params.id!, req.body);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employee]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       204:
 *         description: Employee deleted
 */
// DELETE /employees/:id
employeeRouter.delete("/:id", async (req, res, next) => {
  try {
    const service = Container.get(EmployeeService);
    await service.remove(req.params.id!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
