import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { addRecord, getRecords, getDoctorRecords, editRecord } from "../controller/record.controller.js";

const router = express.Router(); 

router.get(
  "/",
  verifyToken,
  authorizeRoles("doctor"),
  getDoctorRecords
);

/**
 * @swagger
 * /api/record/{appointmentId}:
 *   post:
 *     summary: Add a medical record for an appointment
 *     tags: [Record]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symptoms:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               prescriptions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicine:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     duration:
 *                       type: string
 *     responses:
 *       201:
 *         description: Record added successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.post(
  "/:appointmentId",
  verifyToken,
  authorizeRoles("doctor"),
  addRecord
);

/**
 * @swagger
 * /api/record/{patientId}:
 *   get:
 *     summary: Get medical records of a patient
 *     tags: [Record]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: List of medical records
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Records not found
 */
router.get(
  "/:patientId",
  verifyToken,
  authorizeRoles("patient", "doctor", "admin"),
  getRecords
);

router.put("/:id", verifyToken, authorizeRoles("doctor"), editRecord);

export default router;
