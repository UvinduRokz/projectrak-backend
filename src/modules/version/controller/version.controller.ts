import { Router } from "express";
import { Container } from "typedi";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { VersionService } from "../service/version.service.js";
import { CreateVersionDto } from "../dtos/create-version.dto.js";
import { UpdateVersionDto } from "../dtos/update-version.dto.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const versionRouter = Router();

/**
 * @openapi
 * /projects/{projectId}/versions:
 *   get:
 *     summary: List versions for a project
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Array of versions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VersionResponseDto'
 */
versionRouter.get(
  "/projects/:projectId/versions",
  protect(["admin", "employee"]),
  async (req, res, next) => {
    try {
      const service = Container.get(VersionService);
      const list = await service.findAll(req.params.projectId!);
      res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /projects/{projectId}/versions:
 *   post:
 *     summary: Create a new version for a project
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVersionDto'
 *     responses:
 *       201:
 *         description: Version created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VersionResponseDto'
 */
versionRouter.post(
  "/projects/:projectId/versions",
  protect("admin"),
  validationPipe(CreateVersionDto),
  async (req, res, next) => {
    try {
      const service = Container.get(VersionService);
      const dto = await service.create(req.params.projectId!, req.body);
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /versions/{id}:
 *   get:
 *     summary: Get a single version
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Version ID
 *     responses:
 *       200:
 *         description: Version object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VersionResponseDto'
 */
versionRouter.get(
  "/versions/:id",
  protect(["admin", "employee"]),
  async (req, res, next) => {
    try {
      const service = Container.get(VersionService);
      const dto = await service.findOne(req.params.id!);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /versions/{id}:
 *   put:
 *     summary: Update a version
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Version ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVersionDto'
 *     responses:
 *       200:
 *         description: Updated version
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VersionResponseDto'
 */
versionRouter.put(
  "/versions/:id",
  protect("admin"),
  validationPipe(UpdateVersionDto),
  async (req, res, next) => {
    try {
      const service = Container.get(VersionService);
      const dto = await service.update(req.params.id!, req.body);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /versions/{id}:
 *   delete:
 *     summary: Delete a version
 *     tags: [Version]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Version ID
 *     responses:
 *       204:
 *         description: Version deleted
 */
versionRouter.delete(
  "/versions/:id",
  protect("admin"),
  async (req, res, next) => {
    try {
      const service = Container.get(VersionService);
      await service.remove(req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);
