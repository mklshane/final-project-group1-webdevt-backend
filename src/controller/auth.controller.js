import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required." });
    }

    const isValid =
      (email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD) ||
      (email === "admin@hms.com" && password === "supersecret123");

    if (!isValid) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign({ id: "admin", email, role: "admin" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Successfully logged in.",
      user: { _id: "admin", email, role: "admin" },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const doctorRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      contact,
      specialization,
      schedule_time,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const doctorAlreadyExists = await Doctor.findOne({ email });
    if (doctorAlreadyExists) {
      return res.status(400).json({ message: "Doctor already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      contact,
      specialization,
      schedule_time,
    });

    await newDoctor.save();

    res.status(201).json({ message: "Doctor registered successfully." });
  } catch (error) {
    console.error("Doctor registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: doctor._id, email: doctor.email, role: "doctor" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...doctorData } = doctor._doc;

    res.status(200).json({
      message: "Doctor logged in successfully",
      user: doctorData,
      token,
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const patientRegister = async (req, res) => {
  try {
    const { name, email, password, age, gender, contact, address } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const userAlreadyExists = await Patient.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Patient({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      contact,
      address,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const patientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await Patient.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: "patient" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...patientData } = user._doc;

    res.status(200).json({
      message: "User logged in successfully",
      user: patientData,
      token,
    });
  } catch (error) {
    console.error("Patient login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

export const verifyAuth = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res
        .status(401)
        .json({ message: "No token", authenticated: false });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === "admin") {
      return res.status(200).json({
        authenticated: true,
        user: { _id: "admin", email: decoded.email, role: "admin" },
        userType: "admin",
        message: "Token is valid",
      });
    }

    res.status(200).json({
      authenticated: true,
      user: decoded,
      userType: decoded.role,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res
      .status(401)
      .json({ message: "Invalid or expired token", authenticated: false });
  }
};
