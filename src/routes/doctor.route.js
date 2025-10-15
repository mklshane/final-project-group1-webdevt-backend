import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import {
  deleteDoctorAcc,
  fetchAllDoctors,
  fetchDoctorById,
  updateDoctorData,
} from "../controller/doctor.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/doc:
 *   get:
 *     summary: Fetch all doctors
 *     tags: [Doctor]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of doctors
 *       403:
 *         description: Unauthorized
 */
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "patient"),
  fetchAllDoctors
);

/**
 * @swagger
 * /api/doc/{id}:
 *   get:
 *     summary: Get specific doctor by ID
 *     tags: [Doctor]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor data
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 */
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "doctor", "patient"),
  fetchDoctorById
);

/**
 * @swagger
 * /api/doc/{id}:
 *   put:
 *     summary: Update doctor profile
 *     tags: [Doctor]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
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
 *               specialization:
 *                 type: string
 *               schedule_time:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  updateDoctorData
);

/**
 * @swagger
 * /api/doc/{id}:
 *   delete:
 *     summary: Delete a doctor account
 *     tags: [Doctor]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  deleteDoctorAcc
);

export default router;
