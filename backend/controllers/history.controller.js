import Clip from "../models/Clip.js";

export async function listClips(req, res) {
  const clips = await Clip.find({}).sort({ createdAt: -1 }).limit(200);
  res.json(
    clips.map((c) => ({
      id: c._id,
      filename: c.filename,
      timestamp: c.createdAt,
      url: c.url,
      thumbnail_url: c.thumbnailUrl,
    }))
  );
}
