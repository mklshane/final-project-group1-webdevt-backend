import Log from "../models/log.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";

export const addLog = async (
  message,
  type = "INFO",
  metadata = {},
  createdBy = null,
  createdByModel = null,
  createdByName = "System"
) => {
  try {
    let finalName = createdByName;
    let finalModel = createdByModel;

    if (createdBy && createdByModel) {
      let user;
      if (createdByModel === "Doctor") {
        user = await Doctor.findById(createdBy).select("name");
      } else if (createdByModel === "Patient") {
        user = await Patient.findById(createdBy).select("name");
      }
      if (user) {
        finalName = `${user.name} (${createdByModel})`;
      }
    }

    const log = new Log({
      message,
      type,
      metadata,
      createdBy: createdBy || null,
      createdByModel: createdByModel || "Admin",
      createdByName: finalName,
    });

    await log.save();
    return log;
  } catch (error) {
    console.error("Failed to add log:", error.message);
  }
};
