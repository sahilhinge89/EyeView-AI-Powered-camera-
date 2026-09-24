import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import Clip from "../models/Clip.js";

/**
 * Writes the rolling frame buffer to disk as individual JPEGs, then uses
 * ffmpeg to stitch them into an mp4 — same idea as the original
 * save_clip() in eye-view.py, just running off Node's buffer instead of
 * OpenCV's, and never blocking the inference loop (called fire-and-forget).
 */
export async function saveClip(filename, frames, alertId) {
  if (!frames.length) return;

  const saveDir = process.env.CLIP_SAVE_DIR || "./storage/history_clips";
  fs.mkdirSync(saveDir, { recursive: true });

  const tempDir = path.join(saveDir, `temp_${path.parse(filename).name}`);
  fs.mkdirSync(tempDir, { recursive: true });

  frames.forEach((frame, i) => {
    fs.writeFileSync(path.join(tempDir, `frame_${String(i).padStart(4, "0")}.jpg`), frame);
  });

  const outputPath = path.join(saveDir, filename);
  const fps = Math.max(1, Math.round(frames.length / Number(process.env.CLIP_DURATION_SECONDS || 10)));

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(tempDir, "frame_%04d.jpg"))
      .inputFPS(fps)
      .outputOptions(["-c:v libx264", "-pix_fmt yuv420p"])
      .save(outputPath)
      .on("end", resolve)
      .on("error", reject);
  });

  fs.rmSync(tempDir, { recursive: true, force: true });

  const thumbFilename = `${path.parse(filename).name}_thumb.jpg`;
  await new Promise((resolve) => {
    ffmpeg(outputPath)
      .screenshots({ count: 1, timemarks: ["0.1"], filename: thumbFilename, folder: saveDir })
      .on("end", resolve)
      .on("error", resolve); // thumbnail failure shouldn't crash the flow
  });

  await Clip.create({
    filename,
    url: `/history_clips/${filename}`,
    thumbnailUrl: `/thumbnails/${thumbFilename}`,
    alert: alertId,
  });

  console.log(`Clip saved: ${filename}`);
}
