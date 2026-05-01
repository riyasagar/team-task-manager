function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Not authorized" });

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

const requireAdmin = requireRole("Admin");

module.exports = { requireRole, requireAdmin };
