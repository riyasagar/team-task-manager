const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const {
  createProject,
  addMember,
  removeMember,
  getMyProjects,
  getProjectById,
} = require("../controllers/projectController");

const router = express.Router();

router.use(protect);

// Admin-only actions
router.post("/", requireAdmin, createProject);
router.post("/:projectId/members", requireAdmin, addMember);
router.delete("/:projectId/members/:userId", requireAdmin, removeMember);

// Member-accessible actions (still protected + controller enforces membership)
router.get("/my", getMyProjects);
router.get("/:projectId", getProjectById);

module.exports = router;
