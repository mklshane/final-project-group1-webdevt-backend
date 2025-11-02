
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import docRoutes from "./routes/doctor.route.js";
import patientRoutes from "./routes/patient.route.js";
import aptRoutes from "./routes/appointment.route.js";
import logRoutes from "./routes/log.route.js";
import recRoutes from "./routes/record.route.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { auditLog } from "./middleware/auditLog.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

// CORS – NO credentials (we use JWT in Authorization header)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://medisys.vercel.app",
  "https://medisys-gv95.onrender.com"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    // credentials: true REMOVED
  })
);

app.use(express.json());
app.use(auditLog());

// ROUTES
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/doctor", docRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/appointment", aptRoutes);
app.use("/api/record", recRoutes);
app.use("/api/logs", logRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// START SERVER
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on PORT: ${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
