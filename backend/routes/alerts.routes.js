import { Router } from "express";
import { listAlerts } from "../controllers/alerts.controller.js";

const router = Router();

router.get("/", listAlerts);

export default router;
