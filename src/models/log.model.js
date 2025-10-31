import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "ERROR"],
      default: "INFO",
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel", // ← Dynamic ref
      required: false,
    },
    createdByModel: {
      type: String,
      enum: ["Doctor", "Patient", "Admin"], // ← Admin is virtual
      required: false,
    },
    createdByName: {
      type: String,
      default: "System",
    },
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });

export default mongoose.model("Log", logSchema);
