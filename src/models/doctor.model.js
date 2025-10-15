import mongoose from "mongoose";

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

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
