// middleware/auditLog.js
import { addLog } from "../utils/addLog.js";

const METHOD_TO_ACTION = {
  POST: "created",
  PUT: "updated",
  PATCH: "updated",
  DELETE: "deleted",
};

const ROUTE_PATTERNS = [
  [/^\/api\/appointment\/?$/, "appointment", null],
  [/^\/api\/appointment\/([^/]+)$/, "appointment", "params.id"],
  [/^\/api\/doctor\/?$/, "doctor", null],
  [/^\/api\/doctor\/([^/]+)$/, "doctor", "params.id"],
  [/^\/api\/patient\/?$/, "patient", null],
  [/^\/api\/patient\/([^/]+)$/, "patient", "params.id"],
  [/^\/api\/record\/([^/]+)$/, "medical record", "params.appointmentId"],
];

export const auditLog = () => {
  return async (req, res, next) => {
    const { method, originalUrl, body, params, user } = req;

    // Skip GET / OPTIONS / auth routes
    if (["GET", "OPTIONS"].includes(method)) return next();
    if (originalUrl.startsWith("/api/auth")) return next();

    const originalJson = res.json;

    res.json = async function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const match = ROUTE_PATTERNS.find(([regex]) => regex.test(originalUrl));
        if (!match) return originalJson.call(this, data);

        const [, resource, idPath] = match;
        const resourceId = idPath ? eval(idPath) : null; // safe because idPath is known

        // ---------- ACTOR ----------
        let actorId = null;
        let actorModel = null;
        let actorName = "System";

        if (user) {
          actorId = user.id;
          // Map role → model
          if (user.role === "doctor") actorModel = "Doctor";
          else if (user.role === "patient") actorModel = "Patient";
          else if (user.role === "admin") actorModel = "Admin";

          actorName = `${user.name} (${user.role})`;
        }

        // ---------- MESSAGE ----------
        let message = "";
        const metadata = {
          method,
          path: originalUrl,
          resource,
          resourceId,
        };

        // ----- APPOINTMENTS -----
        if (resource === "appointment") {
          if (method === "POST") {
            message = "New appointment requested by patient.";
            metadata.patientId = body.patient_id;
            metadata.doctorId = body.doctor_id;
            metadata.date = body.appointment_date;
            metadata.time = body.appointment_time;
          } else if (method === "PUT" || method === "PATCH") {
            const status = (body.status || "").toString().trim().toLowerCase();

            if (user?.role === "patient") {
              if (status === "cancelled") {
                message = `Patient cancelled appointment #${resourceId}.`;
              } else if (body.appointment_date || body.appointment_time) {
                message = `Patient rescheduled appointment #${resourceId}.`;
              }
            }

            if (user?.role === "doctor") {
              if (status === "scheduled")
                message = `Dr. approved appointment #${resourceId}.`;
              else if (status === "rejected")
                message = `Dr. rejected appointment #${resourceId}.`;
              else if (status === "completed")
                message = `Dr. marked appointment #${resourceId} as completed.`;
            }
          } else if (method === "DELETE") {
            message = `Appointment #${resourceId} deleted.`;
          }
        }

        // ----- DOCTORS -----
        else if (resource === "doctor") {
          if (method === "POST") {
            message = `New doctor registered: ${body.name || "Dr. Unknown"}`;
            metadata.email = body.email;
          } else if (method === "PUT" || method === "PATCH") {
            const doctorName = data.doctor?.name || body.name || "Dr. Unknown";
            message = `Dr. ${doctorName} updated profile.`;
            metadata.updatedFields = Object.keys(body);
          } else if (method === "DELETE") {
            message = `Doctor account deleted: ID ${resourceId}`;
          }
        }

        // ----- PATIENTS -----
        else if (resource === "patient") {
          if (method === "POST") {
            message = `New patient registered: ${body.name}`;
            metadata.email = body.email;
          } else if (method === "PUT" || method === "PATCH") {
            const patientName = data.patient?.name || body.name || "Unknown";
            message = `Patient ${patientName} updated profile.`;
            metadata.updatedFields = Object.keys(body);
          } else if (method === "DELETE") {
            message = `Patient account deleted: ID ${resourceId}`;
          }
        }

        // ----- MEDICAL RECORDS -----
        else if (resource === "medical record") {
          if (method === "POST") {
            const AppointmentModel = (
              await import("../models/appointment.model.js")
            ).default;
            const apt = await AppointmentModel.findById(resourceId).populate(
              "patient",
              "name"
            );
            const patientName = apt?.patient?.name || "Unknown";
            message = `Dr. added medical record for patient ${patientName}`;
            metadata.appointmentId = resourceId;
          }
        }

        // ----- FALLBACK -----
        if (!message) {
          const action = METHOD_TO_ACTION[method] || method.toLowerCase();
          message = `${capitalize(resource)} ${action}`;
        }

        // ---------- SAVE LOG ----------
        await addLog(message, "INFO", metadata, actorId, actorModel, actorName);
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
