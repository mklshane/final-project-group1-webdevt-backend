import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true, 
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true, 
    },
    symptoms: {
      type: String,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    prescriptions: [
      {
        medicine: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Record = mongoose.model("Record", recordSchema);
export default Record;
