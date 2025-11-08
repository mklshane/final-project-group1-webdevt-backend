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
  [/^\/api\/record\/([^/]+)$/, "medical record", "params.patientId"],
];

export const auditLog = () => {
  return async (req, res, next) => {
    const { method, originalUrl, body, params, user } = req;

    if (["GET", "OPTIONS"].includes(method)) return next();
    if (originalUrl.startsWith("/api/auth")) return next();

    const originalJson = res.json;

    res.json = async function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const match = ROUTE_PATTERNS.find(([regex]) => regex.test(originalUrl));
        if (!match) return originalJson.call(this, data);

        const [, resource, idPath] = match;
        const resourceIdentifier = idPath ? eval(idPath) : null;

        let message = "";
        const metadata = {
          method,
          path: originalUrl,
          resource,
        };

        let actorId = null;
        let actorModel = null;
        let actorName = "System";

        if (user) {
          actorId = user.id;
          actorModel = user.role === "doctor" ? "Doctor" : "Patient";
          actorName = `${user.name} (${user.role})`;
        }

        // ——— APPOINTMENTS ———
        if (resource === "appointment") {
          if (method === "POST") {
            const patientName = body.patient_name || "Unknown Patient";
            const doctorName = body.doctor_name || "Unknown Doctor";
            message = `New appointment scheduled`;
            metadata.patientName = patientName;
            metadata.doctorName = doctorName;
            metadata.date = body.appointment_date;
            metadata.time = body.appointment_time;
            metadata.purpose = body.purpose || "Not specified";
          } else if (method === "PUT" || method === "PATCH") {
            const status = (body.status || "").toString().trim().toLowerCase();

            if (user?.role === "patient") {
              if (status === "cancelled") {
                message = `Patient cancelled their appointment`;
              } else if (body.appointment_date || body.appointment_time) {
                message = `Patient rescheduled appointment`;
              } else {
                message = `Patient updated appointment details`;
              }
            }

            if (user?.role === "doctor") {
              if (status === "scheduled") {
                message = `Doctor approved appointment`;
              } else if (status === "rejected") {
                message = `Doctor rejected appointment request`;
              } else if (status === "completed") {
                message = `Doctor marked appointment as completed`;
              } else {
                message = `Doctor updated appointment details`;
              }
            }

            if (body.status) {
              metadata.newStatus = body.status;
            }
            if (body.appointment_date) {
              metadata.newDate = body.appointment_date;
            }
            if (body.appointment_time) {
              metadata.newTime = body.appointment_time;
            }
          } else if (method === "DELETE") {
            message = `Appointment cancelled and removed from schedule`;
          }
        }

        // ——— DOCTORS ———
        else if (resource === "doctor") {
          if (method === "POST") {
            const doctorName = body.name || "New Doctor";
            const specialty = body.specialty || "General";
            message = `New doctor registered: ${doctorName} (${specialty})`;
            metadata.doctorName = doctorName;
            metadata.specialty = specialty;
            metadata.email = body.email;
            metadata.phone = body.phone;
          } else if (method === "PUT" || method === "PATCH") {
            const doctorName = data.doctor?.name || body.name || "Doctor";
            message = `Doctor updated their profile information`;
            metadata.updatedFields = Object.keys(body);
            metadata.doctorName = doctorName;
          } else if (method === "DELETE") {
            const doctorName = data.doctor?.name || "Doctor";
            message = `Doctor account removed: ${doctorName}`;
            metadata.doctorName = doctorName;
          }
        }

        // ——— PATIENTS ———
        else if (resource === "patient") {
          if (method === "POST") {
            const patientName = body.name || "New Patient";
            message = `New patient registered: ${patientName}`;
            metadata.patientName = patientName;
            metadata.email = body.email;
            metadata.phone = body.phone;
            metadata.dateOfBirth = body.date_of_birth;
          } else if (method === "PUT" || method === "PATCH") {
            const patientName = data.patient?.name || body.name || "Patient";
            message = `Patient updated their profile information`;
            metadata.updatedFields = Object.keys(body);
            metadata.patientName = patientName;
          } else if (method === "DELETE") {
            const patientName = data.patient?.name || "Patient";
            message = `Patient account removed: ${patientName}`;
            metadata.patientName = patientName;
          }
        }

        // ——— MEDICAL RECORDS ———
        else if (resource === "medical record") {
          if (method === "POST") {
            try {
              const AppointmentModel = (
                await import("../models/appointment.model.js")
              ).default;
              const apt = await AppointmentModel.findById(
                resourceIdentifier
              ).populate("patient doctor", "name");
              const patientName = apt?.patient?.name || "Unknown Patient";
              const doctorName = apt?.doctor?.name || "Unknown Doctor";

              message = `Dr. ${doctorName} added medical record for patient ${patientName}`;
              metadata.patientName = patientName;
              metadata.doctorName = doctorName;
              metadata.diagnosis = body.diagnosis;
              metadata.prescription = body.prescription;
              metadata.notes = body.notes
                ? `(${body.notes.length} chars)`
                : "None";
            } catch (error) {
              message = `Medical record created for appointment`;
            }
          } else if (method === "PUT" || method === "PATCH") {
            message = `Medical record updated with new clinical information`;
            if (body.diagnosis) metadata.diagnosisUpdated = true;
            if (body.prescription) metadata.prescriptionUpdated = true;
          }
        }

        // ——— FALLBACK ———
        if (!message) {
          const action = METHOD_TO_ACTION[method] || method.toLowerCase();
          message = `${capitalize(resource)} ${action}`;
        }

        // ——— SAVE LOG ———
        addLog(message, "INFO", metadata, actorId, actorModel, actorName).catch(
          () => {}
        );
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
