import { Router } from "express";
import { Container } from "typedi";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { ProjectService } from "../service/project.service.js";
import { CreateProjectDto } from "../dtos/create-project.dto.js";
import { UpdateProjectDto } from "../dtos/update-project.dto.js";

export const projectRouter = Router();

/**
 * @openapi
 * /projects:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: List projects (optionally filter by companyId)
 *     tags: [Project]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Filter projects by company ID
 *     responses:
 *       200:
 *         description: Array of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectResponseDto'
 */
projectRouter.get("", async (req, res, next) => {
  try {
    const service = Container.get(ProjectService);
    const companyId = req.query.companyId as string;
    const list = await service.findAll(companyId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponseDto'
 *       404:
 *         description: Project not found
 */
projectRouter.get("/:id", async (req, res, next) => {
  try {
    const service = Container.get(ProjectService);
    const dto = await service.findOne(req.params.id!);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectDto'
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponseDto'
 *       400:
 *         description: Validation error
 */
// projectRouter.post(
//   "",
//   validationPipe(CreateProjectDto),
//   async (req, res, next) => {
//     try {
//       const service = Container.get(ProjectService);
//       const { companyId } = req.body as any;
//       const dto = await service.create(companyId, req.body);
//       res.status(201).json(dto);
//     } catch (err) {
//       next(err);
//     }
//   }
// );

projectRouter.post(
  "",
  validationPipe(CreateProjectDto),
  async (req, res, next) => {
    try {
      const service = Container.get(ProjectService);
      const dto = req.body as CreateProjectDto;
      const created = await service.create(dto.companyId, dto);

      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * @openapi
 * /projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectDto'
 *     responses:
 *       200:
 *         description: Updated project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponseDto'
 *       404:
 *         description: Project not found
 */
projectRouter.put(
  "/:id",
  validationPipe(UpdateProjectDto),
  async (req, res, next) => {
    try {
      const service = Container.get(ProjectService);
      const dto = await service.update(req.params.id!, req.body);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       204:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
projectRouter.delete("/:id", async (req, res, next) => {
  try {
    const service = Container.get(ProjectService);
    await service.remove(req.params.id!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
