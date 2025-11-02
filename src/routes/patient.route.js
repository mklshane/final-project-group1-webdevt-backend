import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import {
  deletePatientAcc,
  fetchAllPatients,
  fetchPatientById,
  updatePatientData,
} from "../controller/patient.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/patient:
 *   get:
 *     summary: Fetch all patients
 *     tags: [Patient]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of patients
 *       403:
 *         description: Unauthorized
 */
router.get("/", verifyToken, authorizeRoles("admin", "doctor"), fetchAllPatients);

/**
 * @swagger
 * /api/patient/{id}:
 *   get:
 *     summary: Get specific patient by ID
 *     tags: [Patient]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient data
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "patient", "doctor"),
  fetchPatientById
);

/**
 * @swagger
 * /api/patient/{id}:
 *   put:
 *     summary: Update patient profile
 *     tags: [Patient]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
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
 *       200:
 *         description: Patient updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "patient"),
  updatePatientData
);

/**
 * @swagger
 * /api/patient/{id}:
 *   delete:
 *     summary: Delete a patient account
 *     tags: [Patient]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "patient"),
  deletePatientAcc
);

export default router;
