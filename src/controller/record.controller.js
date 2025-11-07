import Record from "../models/record.model.js";
import Appointment from "../models/appointment.model.js";

export const addRecord = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { symptoms, diagnosis, prescriptions } = req.body;

    const userId = req.user?.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctor.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to add record for this appointment" });
    }

    const existingRecord = await Record.findOne({ appointment: appointmentId });
    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Record for this appointment already exists" });
    }

    const record = new Record({
      patient: appointment.patient,
      doctor: userId,
      appointment: appointmentId,
      symptoms,
      diagnosis,
      prescriptions,
    });

    await record.save();

    return res
      .status(201)
      .json({ message: "Record added successfully", record });
  } catch (error) {
    console.error("Add record error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole === "patient" && userId !== patientId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view these records" });
    }

    if (userRole === "doctor") {
      const doctorRecords = await Record.find({
        patient: patientId,
        doctor: userId,
      })
        .populate("doctor", "name email specialization")
        .populate("patient", "name email contact")
        .populate("appointment", "appointment_date appointment_time status");

      return res.status(200).json({ records: doctorRecords });
    }

    if (userRole === "admin") {
      const allRecords = await Record.find({ patient: patientId })
        .populate("doctor", "name email specialization")
        .populate("patient", "name email contact")
        .populate("appointment", "appointment_date appointment_time status");

      return res.status(200).json({ records: allRecords });
    }

    if (userRole === "patient") {
      const patientRecords = await Record.find({ patient: patientId })
        .populate("doctor", "name email specialization")
        .populate("patient", "name email contact")
        .populate("appointment", "appointment_date appointment_time status");

      return res.status(200).json({ records: patientRecords });
    }

    return res.status(403).json({ message: "Invalid role" });
  } catch (error) {
    console.error("Get records error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ──────────────────────────────────────────────────────
//  REPLACE the whole getDoctorRecords function with this
// ──────────────────────────────────────────────────────
export const getDoctorRecords = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== "doctor") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. FETCH + POPULATE
    const records = await Record.find({ doctor: userId })
      .populate("patient", "name email contact")
      .populate("appointment", "appointment_date appointment_time status")
      .sort({ "appointment.appointment_date": -1 });

    // 2. DEBUG LOG (you can delete later)
    console.log(
      "Raw DB records →",
      records.map(r => ({
        _id: r._id,
        appointmentId: r.appointment?._id ?? r.appointment,
        populated: !!r.appointment,
      }))
    );

    // 3. FILTER OUT records whose appointment could NOT be populated
    const validRecords = records.filter(r => {
      if (!r.appointment) {
        console.warn(`Skipping record ${r._id} – appointment missing`);
        return false;
      }
      return true;
    });

    // 4. ENRICH with _category
    const enrichedRecords = validRecords.map(record => {
      const apptDate = new Date(record.appointment.appointment_date);
      const category = apptDate >= thirtyDaysAgo ? "recent" : "older";

      return {
        ...record.toObject(),
        _category: category,
      };
    });

    console.log(`Returning ${enrichedRecords.length} valid records`);
    return res.status(200).json({ records: enrichedRecords });
  } catch (error) {
    console.error("Get doctor records error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};