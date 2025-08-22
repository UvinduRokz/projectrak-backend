import { Router } from "express";
import { Container } from "typedi";
import multer from "multer";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { PrmService } from "../service/prm.service.js";
import { CreatePrmDto } from "../dtos/create-prm.dto.js";
import type { RequestHandler } from "express";

const upload = multer({ dest: "uploads/prm/" });
export const prmRouter = Router();

/**
 * @openapi
 * /prm:
 *   get:
 *     summary: List PRMs for a company
 *     tags: [PRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Array of PRMs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   file:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */

// GET /prm?companyId=…
prmRouter.get("", async (req, res, next) => {
  try {
    const service = Container.get(PrmService);
    const companyId = req.query.companyId as string;
    const list = await service.list(companyId);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /prm/{id}:
 *   get:
 *     summary: Get a single PRM by ID
 *     tags: [PRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PRM ID
 *     responses:
 *       200:
 *         description: PRM object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 file:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 */

// GET /prm/:id
prmRouter.get("/:id", async (req, res, next) => {
  try {
    const service = Container.get(PrmService);
    const dto = await service.getOne(req.params.id!);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /prm:
 *   post:
 *     summary: Upload a new PRM file
 *     tags: [PRM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: PRM uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 file:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: File required
 */

// POST /prm  (multipart/form-data)
prmRouter.post("", upload.single("file"), validationPipe(CreatePrmDto), (async (
  req,
  res,
  next
) => {
  try {
    const service = Container.get(PrmService);
    if (!req.file) {
      return res.status(400).json({ message: "file_required" });
    }
    const result = await service.upload(
      req.file,
      req.body,
      (req.user as any).userId
    );
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}) as RequestHandler);

/**
 * @openapi
 * /prm/{id}:
 *   delete:
 *     summary: Delete a PRM
 *     tags: [PRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PRM ID
 *     responses:
 *       204:
 *         description: PRM deleted
 */

// DELETE /prm/:id
prmRouter.delete("/:id", async (req, res, next) => {
  try {
    const service = Container.get(PrmService);
    await service.remove(req.params.id!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
