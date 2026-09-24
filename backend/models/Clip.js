import mongoose from "mongoose";

const clipSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    alert: { type: mongoose.Schema.Types.ObjectId, ref: "Alert", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Clip", clipSchema);
