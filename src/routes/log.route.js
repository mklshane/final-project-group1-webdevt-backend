// routes/log.route.js
import express from "express";
import { getLogs } from "../controller/log.controller.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Get system logs (Admin only)
 *     tags: [Logs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated logs
 */
router.get("/", verifyToken, authorizeRoles("admin"), getLogs);

export default router;
