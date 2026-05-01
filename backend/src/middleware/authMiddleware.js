const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const hasBearer = typeof header === "string" && header.startsWith("Bearer ");
    if (!hasBearer) return res.status(401).json({ message: "Not authorized" });

    const token = header.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ message: "Server misconfigured" });

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "Not authorized" });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
}

module.exports = { protect };
