import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    time: { type: Date, default: Date.now },
    confidence: { type: Number, required: true },
    location: { type: String, default: "Unknown Location" },
    videoUrl: { type: String, default: null },
    notified: { type: Boolean, default: false },
    alertType: { type: String, default: "Violence Detected" },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
