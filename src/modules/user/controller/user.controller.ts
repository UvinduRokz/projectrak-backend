import { Router } from "express";
import { Container } from "typedi";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { UserService } from "../service/user.service.js";
import { UpdateUserDto } from "../dtos/update-user.dto.js";

export const userRouter = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponseDto'
 */
// GET /users
userRouter.get("", async (_req, res, next) => {
  try {
    const service = Container.get(UserService);
    const list = await service.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 */
// GET /users/:id
userRouter.get("/:id", async (req, res, next) => {
  try {
    const service = Container.get(UserService);
    const dto = await service.findOne(req.params.id!);
    res.json(dto);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: Updated user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 */
// PUT /users/:id
userRouter.put(
  "/:id",
  validationPipe(UpdateUserDto),
  async (req, res, next) => {
    try {
      const service = Container.get(UserService);
      const dto = await service.update(req.params.id!, req.body);
      res.json(dto);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted
 */
// DELETE /users/:id
userRouter.delete("/:id", async (req, res, next) => {
  try {
    const service = Container.get(UserService);
    await service.remove(req.params.id!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
