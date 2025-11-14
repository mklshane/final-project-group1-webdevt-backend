import mongoose from "mongoose";
import Record from "./record.model";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

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

appointmentSchema.pre("findOneAndDelete", async function (next) {
  try {
    const query = this.getQuery();
    await Record.deleteMany({ appointment: query._id });
    next();
  } catch (err) {
    next(err);
  }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
