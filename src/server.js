
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import docRoutes from "./routes/doctor.route.js";
import patientRoutes from "./routes/patient.route.js";
import aptRoutes from "./routes/appointment.route.js";
import logRoutes from "./routes/log.route.js";
import cookieParser from "cookie-parser";
import recRoutes from "./routes/record.route.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { auditLog } from "./middleware/auditLog.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://medisys.vercel.app"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// GLOBAL AUDIT LOG 
app.use(auditLog());

// ROUTES
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/doctor", docRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointment", aptRoutes);
app.use("/api/record", recRoutes);
app.use("/api/logs", logRoutes); 

// START SERVER
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on PORT: ${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});
