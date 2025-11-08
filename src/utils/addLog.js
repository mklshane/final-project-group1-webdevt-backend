// utils/addLog.js
import Log from "../models/log.model.js";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";

export const addLog = async (
  message,
  type = "INFO",
  metadata = {},
  createdBy = null,
  createdByModel = null, // <-- keep exactly what the caller gave us
  createdByName = "System"
) => {
  try {
    let finalName = createdByName;
    let finalModel = createdByModel; // <-- do NOT force “Admin”

    // Resolve name only when we have a valid ID + model
    if (createdBy && createdByModel) {
      let user;
      if (createdByModel === "Doctor") {
        user = await Doctor.findById(createdBy).select("name");
      } else if (createdByModel === "Patient") {
        user = await Patient.findById(createdBy).select("name");
      }

      if (user) {
        finalName = `${user.name} (${createdByModel})`;
      } else {
        // ID exists but user not found → keep the name we already have
        finalName = createdByName || "Unknown User";
      }
    }

    const log = new Log({
      message,
      type,
      metadata,
      createdBy: createdBy || null,
      createdByModel: finalModel, // <-- preserve exact model
      createdByName: finalName,
    });

    await log.save();
    return log;
  } catch (error) {
    console.error("Failed to add log:", error.message);
  }
};
