const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function isMember(project, userId) {
  return project.members.some((m) => String(m) === String(userId));
}

async function loadProjectAndVerifyMember(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { error: { status: 404, message: "Project not found" } };
  if (!isMember(project, userId)) return { error: { status: 403, message: "Project access required" } };
  return { project };
}

// POST /api/tasks  { title, description?, projectId, assignedTo?, dueDate?, status? }
async function createTask(req, res) {
  try {
    const { title, description, projectId, assignedTo, dueDate, status } = req.body || {};
    if (!title || !projectId) {
      return res.status(400).json({ message: "title and projectId are required" });
    }
    if (!isObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });

    const { project, error } = await loadProjectAndVerifyMember(projectId, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (assignedTo) {
      if (!isObjectId(assignedTo)) return res.status(400).json({ message: "Invalid assignedTo" });
      if (!isMember(project, assignedTo)) {
        return res.status(400).json({ message: "assignedTo must be a project member" });
      }
      const exists = await User.exists({ _id: assignedTo });
      if (!exists) return res.status(404).json({ message: "Assigned user not found" });
    }

    const normalizedStatus =
      status === "Todo" || status === "In Progress" || status === "Done" ? status : "Todo";

    const task = await Task.create({
      title,
      description: description || "",
      project: project._id,
      assignedTo: assignedTo || null,
      status: normalizedStatus,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const populated = await Task.findById(task._id).populate("assignedTo", "name email role");
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// PATCH /api/tasks/:taskId/assign  { assignedTo }
async function assignTask(req, res) {
  try {
    const { taskId } = req.params;
    const { assignedTo } = req.body || {};
    if (!isObjectId(taskId)) return res.status(400).json({ message: "Invalid taskId" });
    if (!assignedTo || !isObjectId(assignedTo)) {
      return res.status(400).json({ message: "assignedTo is required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { project, error } = await loadProjectAndVerifyMember(task.project, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!isMember(project, assignedTo)) {
      return res.status(400).json({ message: "assignedTo must be a project member" });
    }

    const exists = await User.exists({ _id: assignedTo });
    if (!exists) return res.status(404).json({ message: "Assigned user not found" });

    task.assignedTo = assignedTo;
    await task.save();

    const populated = await Task.findById(task._id).populate("assignedTo", "name email role");
    return res.status(200).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// PATCH /api/tasks/:taskId/status  { status }
async function updateTaskStatus(req, res) {
  try {
    const { taskId } = req.params;
    const { status } = req.body || {};
    if (!isObjectId(taskId)) return res.status(400).json({ message: "Invalid taskId" });
    if (!status) return res.status(400).json({ message: "status is required" });
    if (!["Todo", "In Progress", "Done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { project, error } = await loadProjectAndVerifyMember(task.project, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    // Check permissions: only assigned user or admin can update status
    const isGlobalAdmin = req.user.role === "Admin";
    const isProjectAdmin = project.roles?.get(String(req.user._id)) === "Admin";
    const isAdmin = isGlobalAdmin || isProjectAdmin;
    
    // Handle both populated (object with _id) and unpopulated (ObjectId) assignedTo
    const assignedToId = task.assignedTo ? (task.assignedTo._id || task.assignedTo).toString() : null;
    const isAssigned = assignedToId && assignedToId === String(req.user._id);
    
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: "Only the assigned user or admin can update task status" });
    }

    task.status = status;
    await task.save();
    const populated = await Task.findById(task._id).populate("assignedTo", "name email role");
    return res.status(200).json(populated);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// GET /api/tasks/project/:projectId
async function getTasksByProject(req, res) {
  try {
    const { projectId } = req.params;
    if (!isObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });

    const { project, error } = await loadProjectAndVerifyMember(projectId, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// GET /api/tasks/overdue
async function getOverdueTasks(req, res) {
  try {
    const myProjects = await Project.find({ members: req.user._id }).select("_id");
    const projectIds = myProjects.map((p) => p._id);

    const now = new Date();
    const overdue = await Task.find({
      project: { $in: projectIds },
      dueDate: { $ne: null, $lt: now },
      status: { $ne: "Done" },
    })
      .populate("assignedTo", "name email role")
      .populate("project", "title")
      .sort({ dueDate: 1 });

    return res.status(200).json(overdue);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// GET /api/tasks/my
async function getMyTasks(req, res) {
  try {
    const myProjects = await Project.find({ members: req.user._id }).select("_id");
    const projectIds = myProjects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("assignedTo", "name email role")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// GET /api/tasks/my-assigned
async function getMyAssignedTasks(req, res) {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("project", "title")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

module.exports = {
  createTask,
  assignTask,
  updateTaskStatus,
  getTasksByProject,
  getOverdueTasks,
  getMyTasks,
  getMyAssignedTasks,
};
