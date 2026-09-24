import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  register,
  login,
  getProfile,
  updateProfile,
  getAnalytics,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.get("/analytics", requireAuth, getAnalytics);

export default router;
