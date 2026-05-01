const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function isMember(project, userId) {
  if (!project.members || !Array.isArray(project.members)) return false;
  return project.members.some((m) => {
    // Handle both populated (object with _id) and unpopulated (ObjectId) members
    const memberId = m._id || m;
    return String(memberId) === String(userId);
  });
}

function projectRole(project, userId) {
  if (!project.roles) return null;
  return project.roles.get(String(userId)) || null;
}

function canManageMembers(project, user) {
  // global Admin OR project-scoped Admin
  if (user?.role === "Admin") return true;
  return projectRole(project, user?._id) === "Admin";
}

// POST /api/projects (Admin only - global Admin)
async function createProject(req, res) {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { title, description } = req.body || {};
    if (!title) return res.status(400).json({ message: "title is required" });

    const createdBy = req.user._id;
    const project = await Project.create({
      title,
      description: description || "",
      createdBy,
      members: [createdBy],
      roles: new Map([[String(createdBy), "Admin"]]),
    });

    return res.status(201).json(project);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// POST /api/projects/:projectId/members  { userId, role? }
async function addMember(req, res) {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body || {};

    if (!isObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });
    if (!isObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: "Project access required" });
    }

    if (!canManageMembers(project, req.user)) {
      return res.status(403).json({ message: "Not allowed to manage members" });
    }

    const userExists = await User.exists({ _id: userId });
    if (!userExists) return res.status(404).json({ message: "User not found" });

    if (!isMember(project, userId)) project.members.push(userId);

    const normalizedRole = role === "Admin" ? "Admin" : "Member";
    project.roles.set(String(userId), normalizedRole);

    await project.save();
    // Populate members before returning
    await project.populate("members", "name email role");
    await project.populate("createdBy", "name email role");
    return res.status(200).json(project);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// DELETE /api/projects/:projectId/members/:userId
async function removeMember(req, res) {
  try {
    const { projectId, userId } = req.params;

    if (!isObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });
    if (!isObjectId(userId)) return res.status(400).json({ message: "Invalid userId" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: "Project access required" });
    }

    if (!canManageMembers(project, req.user)) {
      return res.status(403).json({ message: "Not allowed to manage members" });
    }

    // Prevent removing the creator (simplifies ownership semantics)
    if (String(project.createdBy) === String(userId)) {
      return res.status(400).json({ message: "Cannot remove project creator" });
    }

    project.members = project.members.filter((m) => String(m) !== String(userId));
    if (project.roles) project.roles.delete(String(userId));

    await project.save();
    // Populate members before returning
    await project.populate("members", "name email role");
    await project.populate("createdBy", "name email role");
    return res.status(200).json(project);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// GET /api/projects/my
async function getMyProjects(req, res) {
  try {
    const projects = await Project.find({ members: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("members", "name email role")
      .populate("createdBy", "name email role");
    return res.status(200).json(projects);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

// GET /api/projects/:projectId
async function getProjectById(req, res) {
  try {
    const { projectId } = req.params;
    if (!isObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId" });

    const project = await Project.findById(projectId)
      .populate("members", "name email role")
      .populate("createdBy", "name email role");

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!isMember(project, req.user._id)) {
      return res.status(403).json({ message: "Project access required" });
    }

    return res.status(200).json(project);
  } catch (err) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}

module.exports = { createProject, addMember, removeMember, getMyProjects, getProjectById };
