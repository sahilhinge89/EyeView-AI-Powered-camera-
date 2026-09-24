import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import alertsRoutes from "./routes/alerts.routes.js";
import historyRoutes from "./routes/history.routes.js";
import streamRoutes from "./routes/stream.routes.js";

import { startCaptureLoop } from "./services/videoCapture.js";
import { startInferenceLoop } from "./services/inferenceWorker.js";

const app = express();

app.use(cors());
app.use(express.json());

const clipDir = process.env.CLIP_SAVE_DIR || "./storage/history_clips";
fs.mkdirSync(clipDir, { recursive: true });
app.use("/history_clips", express.static(clipDir));
app.use("/thumbnails", express.static(clipDir));

app.use("/auth", authRoutes);
app.use("/alerts", alertsRoutes);
app.use("/history_clips", historyRoutes); // JSON listing endpoint, static files above serve the actual files
app.use("/", streamRoutes); // exposes /video_feed

app.get("/health", (req, res) => res.json({ status: "ok" }));

async function start() {
  await connectDB();

  // LOOP 1: capture — always keeps the latest frame + rolling buffer fresh
  startCaptureLoop();

  // LOOP 3: inference — calls the Python microservice at its own pace,
  // never blocking capture or the video stream (LOOP 2 below).
  startInferenceLoop();

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`EyeView backend running on http://localhost:${port}`));
}

start();

// Note: LOOP 2 (streaming) doesn't need a persistent background process —
// it starts/stops per browser connection inside mjpegStreamHandler, reading
// whatever LOOP 1 last wrote to the shared frameBuffer.
