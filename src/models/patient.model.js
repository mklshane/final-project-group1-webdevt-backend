import mongoose from "mongoose";
import Appointment from "./appointment.model.js";
import Record from "./record.model.js";

const patientSchema = new mongoose.Schema({
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
    required: false,
  },
  gender: {
    type: String,
  },

  contact: {
    type: String,
    required: false,
    trim: true,
  },
  address: {
    type: String,
  },
});

patientSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const patientId = this._id;

      await Appointment.deleteMany({ patient: patientId });

      await Record.deleteMany({ patient: patientId });

      next();
    } catch (error) {
      console.error("Error in patient cascade delete:", error);
      next(error);
    }
  }
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
