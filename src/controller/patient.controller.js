import Patient from "../models/patient.model.js";

export const fetchAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select("-password");

    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: "No patients found" });
    }

    res.status(200).json({
      message: "Patients fetched successfully",
      patients,
    });
  } catch (error) {
    console.error("Error fetching patients: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const fetchPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      message: "Patiend fetched successfully",
      patient,
    });
  } catch (error) {
    console.error("Fetch patient by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const updatePatientData = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedPatient = await Patient.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedPatient) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePatientAcc = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "User not found" });
    }

    await patient.deleteOne();

    return res.status(200).json({
      message:
        "Patient account, appointments, and medical records deleted successfully",
      patient: patient,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};