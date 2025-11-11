import mongoose from "mongoose";
import Appointment from "./appointment.model.js";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    contact: {
      type: String,
    },
    specialization: {
      type: String,
      enum: [
        "Cardiology",
        "Neurology",
        "Pediatrics",
        "Orthopedics",
        "Dermatology",
        "General Medicine",
        "Ophthalmology",
        "Psychiatry",
        "ENT",
        "Radiology",
      ],
    },
    schedule_time: {
      type: [String],
    },
  },
  { timestamps: true }
);

doctorSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await Appointment.deleteMany({ doctor: this._id });
      next();
    } catch (error) {
      console.error("Error deleting appointments on doctor delete:", error);
      next(error);
    }
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
