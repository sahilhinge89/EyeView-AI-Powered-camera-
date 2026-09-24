import mongoose from "mongoose";

const loginRecordSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    ip: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    analytics: {
      loginCount: { type: Number, default: 0 },
      lastLogin: { type: Date, default: null },
      loginHistory: { type: [loginRecordSchema], default: [] },
      totalAlertsViewed: { type: Number, default: 0 },
      totalClipsViewed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
