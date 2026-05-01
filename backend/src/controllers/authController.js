const User = require("../models/User");
const generateToken = require("../utils/generateToken");

function sanitizeUser(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "Member",
    });

    const token = generateToken({ userId: user._id });
    return res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select(
      "+password"
    );

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken({ userId: user._id });
    return res.status(200).json({ user: sanitizeUser(user), token });
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    return res.status(200).json({ user: sanitizeUser(req.user) });
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// GET /api/auth/users?q=searchTerm
async function searchUsers(req, res) {
  try {
    const { q } = req.query || {};
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Query must be at least 2 characters" });
    }

    const searchRegex = new RegExp(q.trim(), "i");
    const users = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    })
      .select("name email role")
      .limit(10);

    return res.status(200).json(users.map(sanitizeUser));
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

module.exports = { signup, login, me, searchUsers };
