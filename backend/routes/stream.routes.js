import { Router } from "express";
import { mjpegStreamHandler } from "../services/streamService.js";

const router = Router();

router.get("/video_feed", mjpegStreamHandler);

export default router;
