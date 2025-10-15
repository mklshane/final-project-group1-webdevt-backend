import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointment_date: {
      type: Date,
      required: true,
    },
    appointment_time: {
      type: String, 
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "Pending", "Rejected"],
      default: "Pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } 
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
