import Alert from "../models/Alert.js";

export async function listAlerts(req, res) {
  const alerts = await Alert.find({}).sort({ time: -1 }).limit(200);
  res.json({
    alerts: alerts.map((a) => ({
      timestamp: a.time,
      location: a.location,
      confidence: a.confidence,
      notified: a.notified,
      alert_type: a.alertType,
      video_url: a.videoUrl,
    })),
  });
}
