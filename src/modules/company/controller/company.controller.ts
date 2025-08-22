import { Router } from "express";
import { Container } from "typedi";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { CompanyService } from "../service/company.service.js";
import { UpdateCompanyDto } from "../dtos/update-company.dto.js";
import { UpsertUserImportConfigDto } from "@/modules/auth/dtos/user-import.dto.js";
import { BadRequestError } from "@/shared/errors/index.js";

export const companyRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Company
 *     description: Company management endpoints
 *
 * /companies:
 *   get:
 *     summary: List all companies
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CompanyResponseDto'
 */
companyRouter.get("", async (_req, res, next) => {
  try {
    const service = Container.get(CompanyService);
    const list = await service.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /companies/{id}:
 *   get:
 *     summary: Get a single company by ID
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponseDto'
 */
companyRouter.get("/:id", async (req, res, next) => {
  try {
    const service = Container.get(CompanyService);
    const dto = await service.findOne(req.params.id);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /companies/{id}/user-import-config:
 *   put:
 *     summary: Upsert user‐import config for a company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertUserImportConfigDto'
 *     responses:
 *       200:
 *         description: Updated company record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponseDto'
 */
companyRouter.put(
  "/:id/user-import-config",
  validationPipe(UpsertUserImportConfigDto),
  async (req, res, next) => {
    try {
      const service = Container.get(CompanyService);
      const { id } = req.params;
      if (typeof id !== "string") {
        return next(new BadRequestError("company_id_missing"));
      }
      const cfg = req.body as UpsertUserImportConfigDto;
      const updated = await service.upsertUserImportConfig(id, cfg);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /companies/{id}/sync-users:
 *   post:
 *     summary: Trigger user‐sync for a company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sync started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: sync_started
 */
companyRouter.post("/:id/sync-users", async (req, res, next) => {
  try {
    const service = Container.get(CompanyService);
    await service.syncUsers(req.params.id);
    res.json({ message: "sync_started" });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /companies/{id}/sync-users-json:
 *   post:
 *     summary: Trigger user-sync using JSON file contents
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               json_file:
 *                 type: string
 *                 format: json
 *                 example: '[{"name": "John", "email": "john@example.com"}]'
 *     responses:
 *       200:
 *         description: JSON sync completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: json_sync_complete
 */
companyRouter.post("/:id/sync-users-json", async (req, res, next) => {
  try {
    const service = Container.get(CompanyService);
    const { id } = req.params;
    const { json_file } = req.body;

    if (!json_file || typeof json_file !== "string") {
      throw new BadRequestError("json_file_required");
    }

    await service.syncUsersFromJson(id, json_file);
    res.json({ message: "json_sync_complete" });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /companies/{id}:
 *   put:
 *     summary: Update company details
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompanyDto'
 *     responses:
 *       200:
 *         description: Updated company object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyResponseDto'
 */
companyRouter.put(
  "/:id",
  validationPipe(UpdateCompanyDto),
  async (req, res, next) => {
    try {
      const service = Container.get(CompanyService);
      const dto = await service.update(req.params.id!, req.body);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /companies/{id}:
 *   delete:
 *     summary: Delete a company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Company deleted
 */
companyRouter.delete("/:id", async (req, res, next) => {
  try {
    const service = Container.get(CompanyService);
    await service.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
