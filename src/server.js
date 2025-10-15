import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js"
import docRoutes from "./routes/doctor.route.js"
import patientRoutes from "./routes/patient.route.js"
import aptRoutes from "./routes/appointment.route.js"
import cookieParser from "cookie-parser"
import recRoutes from "./routes/record.route.js"
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({
    origin: "https://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/doctor", docRoutes)
app.use("/api/patient", patientRoutes)
app.use("/api/appointment", aptRoutes)
app.use("/api/record", recRoutes)

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on PORT:", PORT)
} )


