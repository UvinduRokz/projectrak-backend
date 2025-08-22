import { Router } from "express";
import { Container } from "typedi";

import { AuthService } from "../service/auth.service.js";
import { RegisterDto } from "../dtos/register.dto.js";
import { LoginDto } from "../dtos/admin-login.dto.js";
import { EmployeeLoginDto } from "../dtos/employee-login.dto.js";
import { validationPipe } from "@/shared/validators/validate.dto.js";
import { protect } from "@/shared/middlewares/protect.middleware.js";

export const authRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 *
 * /auth/register:
 *   post:
 *     summary: Register a new admin user and company
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDto'
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 */
authRouter.post(
  "/register",
  validationPipe(RegisterDto),
  async (req, res, next) => {
    try {
      const service = Container.get(AuthService);
      const user = await service.register(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Admin login to obtain JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/login", validationPipe(LoginDto), async (req, res, next) => {
  try {
    const service = Container.get(AuthService);
    const auth = await service.login(req.body);
    res.json(auth);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/employee-login:
 *   post:
 *     summary: Employee login to obtain JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeLoginDto'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or passkey
 */
authRouter.post(
  "/employee-login",
  validationPipe(EmployeeLoginDto),
  async (req, res, next) => {
    try {
      const service = Container.get(AuthService);
      const auth = await service.employeeLogin(req.body);
      res.json(auth);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current admin user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponseDto'
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/me", protect("admin"), async (req, res, next) => {
  try {
    const service = Container.get(AuthService);
    const { userId } = req.user as { userId: string };
    const me = await service.me(userId);
    res.json(me);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/employee-me:
 *   get:
 *     summary: Get current employee info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponseDto'
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/employee-me", protect("employee"), async (req, res, next) => {
  try {
    const service = Container.get(AuthService);
    const { userId } = req.user as { userId: string };
    const me = await service.employeeMe(userId);
    res.json(me);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout current user (stateless JWT)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRouter.post("/logout", (_req, res) => {
  res.json({ message: "logged_out" });
});
