const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin, requireRole } = require("../middleware/roleMiddleware");
const {
  createTask,
  assignTask,
  updateTaskStatus,
  getTasksByProject,
  getOverdueTasks,
  getMyTasks,
  getMyAssignedTasks,
} = require("../controllers/taskController");

const router = express.Router();

router.use(protect);

// Important task operations (Admin)
router.post("/", requireAdmin, createTask);
router.patch("/:taskId/assign", requireAdmin, assignTask);

// Member-accessible
router.get("/my", getMyTasks);
router.get("/my-assigned", getMyAssignedTasks);
router.get("/overdue", getOverdueTasks);
router.get("/project/:projectId", getTasksByProject);
router.patch("/:taskId/status", requireRole("Admin", "Member"), updateTaskStatus);

module.exports = router;
