import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
  };
}

export async function register(req, res) {
  const { email, password, firstName = "", lastName = "" } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, firstName, lastName });

  const token = signToken(user);
  res.status(201).json({ message: "User created successfully", access_token: token, user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  user.analytics.loginCount += 1;
  user.analytics.lastLogin = new Date();
  user.analytics.loginHistory.push({ timestamp: new Date(), ip: req.ip });
  user.analytics.loginHistory = user.analytics.loginHistory.slice(-50);
  await user.save();

  const token = signToken(user);
  res.json({ message: "Login successful", access_token: token, user: publicUser(user) });
}

export async function getProfile(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
}

export async function updateProfile(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { firstName, lastName } = req.body;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  await user.save();

  res.json({ message: "Profile updated successfully", user: publicUser(user) });
}

export async function getAnalytics(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const allUsers = await User.find({});
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => u.analytics.lastLogin).length;

  const loginTrends = {};
  for (const u of allUsers) {
    for (const login of u.analytics.loginHistory.slice(-30)) {
      const date = new Date(login.timestamp).toISOString().slice(0, 10);
      loginTrends[date] = (loginTrends[date] || 0) + 1;
    }
  }

  res.json({
    user_analytics: {
      login_count: user.analytics.loginCount,
      last_login: user.analytics.lastLogin,
      login_history: user.analytics.loginHistory,
      total_alerts_viewed: user.analytics.totalAlertsViewed,
      total_clips_viewed: user.analytics.totalClipsViewed,
    },
    global_analytics: {
      total_users: totalUsers,
      active_users: activeUsers,
      login_trends: loginTrends,
    },
  });
}
