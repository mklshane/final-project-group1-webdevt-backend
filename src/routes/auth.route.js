import express from "express";
import {
  adminLogin,
  doctorLogin,
  doctorRegister,
  logout,
  patientLogin,
  patientRegister,
  verifyAuth
} from "../controller/auth.controller.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post("/admin/login", adminLogin);

/**
 * @swagger
 * /api/auth/doctor/register:
 *   post:
 *     summary: Register a doctor (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []   # ✅ FIXED HERE!
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               contact:
 *                 type: string
 *               specialization:
 *                 type: string
 *               schedule_time:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *       400:
 *         description: Doctor already exists
 */
router.post(
  "/doctor/register",
  verifyToken,
  authorizeRoles("admin"),
  doctorRegister
);

/**
 * @swagger
 * /api/auth/doctor/login:
 *   post:
 *     summary: Doctor login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post("/doctor/login", doctorLogin);

/**
 * @swagger
 * /api/auth/patient/register:
 *   post:
 *     summary: Register a patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               age:
 *                 type: number
 *               gender:
 *                 type: string
 *               contact:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: User already exists
 */
router.post("/patient/register", patientRegister);

/**
 * @swagger
 * /api/auth/patient/login:
 *   post:
 *     summary: Patient login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post("/patient/login", patientLogin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (clear token cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Token expired/invalid
 */

router.get("/verify", verifyAuth)

export default router;
