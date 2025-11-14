import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  updateAppointment,
} from "../controller/appointment.controller.js";
import Appointment from "../models/appointment.model.js";

const router = express.Router();

/**
 * @swagger
 * /api/appointment:
 *   post:
 *     summary: Create a new appointment (Patient only)
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor
 *               - appointment_date
 *               - appointment_time
 *             properties:
 *               doctor:
 *                 type: string
 *                 description: Doctor ID
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               appointment_time:
 *                 type: string
 *                 description: Appointment time
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Invalid input or appointment already exists
 */
router.post("/", verifyToken, authorizeRoles("patient"), createAppointment);

/**
 * @swagger
 * /api/appointment:
 *   get:
 *     summary: Get appointments (Role-based)
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *       403:
 *         description: Unauthorized
 */
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "patient", "doctor"),
  getAppointment
);

/**
 * @swagger
 * /api/appointment/patient/{patientId}:
 *   get:
 *     summary: Get past appointments for a specific patient (admin/doctor only)
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of past appointments
 */
router.get(
  "/patient/:patientId",
  verifyToken,
  authorizeRoles("admin", "doctor"),
  async (req, res) => {
    try {
      const { patientId } = req.params;

      const appointments = await Appointment.find({
        patient: patientId,
        status: { $nin: ["Pending", "Scheduled"] }, // only past
      })
        .populate("doctor", "name email specialization")
        .sort({ appointment_date: -1 });

      res.status(200).json({ appointments });
    } catch (error) {
      console.error("Get patient history error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /api/appointment/{id}:
 *   put:
 *     summary: Update an appointment (Patient/Doctor)
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               status:
 *                 type: string
 *                 enum: [Scheduled, Completed, Cancelled, Pending, Rejected]
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               appointment_time:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("doctor", "patient"),
  updateAppointment
);

/**
 * @swagger
 * /api/appointment/{id}:
 *   delete:
 *     summary: Delete an appointment (Admin only)
 *     tags: [Appointments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.delete("/:id", verifyToken, authorizeRoles("admin", "doctor"), deleteAppointment);

export default router;
