import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import TaskCard from "../components/TaskCard";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  RefreshCw,
  FolderOpen,
  Users,
  Plus,
  Search,
  X,
  Crown,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  User,
  UserCircle,
  Calendar,
  FileText,
  Circle,
  PlayCircle,
  Clock
} from "lucide-react";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { user } = useAuth();
  
  // All state declarations first
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createDueDate, setCreateDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  
  // Check both global admin role and project-level admin role - use useMemo to update when project changes
  const isAdmin = useMemo(() => {
    const isGlobalAdmin = user?.role === "Admin";
    // Handle both Map (serialized as object) and regular object formats
    const userRole = project?.roles?.[user?._id] || project?.roles?.[String(user?._id)];
    const isProjectAdmin = userRole === "Admin";
    return isGlobalAdmin || isProjectAdmin;
  }, [user, project]);

  const counts = useMemo(() => {
    const c = { Todo: 0, "In Progress": 0, Done: 0 };
    tasks.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status] += 1;
    });
    return c;
  }, [tasks]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/api/projects/${projectId}`),
        api.get(`/api/tasks/project/${projectId}`),
      ]);
      setProject(pRes.data);
      setMembers(pRes.data?.members || []);
      setTasks(tRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const onStatusChange = async (task, status) => {
    try {
      const res = await api.patch(`/api/tasks/${task._id}/status`, { status });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  const onAssign = async (task, assignedTo) => {
    try {
      if (!assignedTo) {
        alert("Pick a member to assign");
        return;
      }
      const res = await api.patch(`/api/tasks/${task._id}/assign`, { assignedTo });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to assign task");
    }
  };

  // Search users for adding members
  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/api/auth/users?q=${encodeURIComponent(searchQuery.trim())}`);
      // Filter out existing members
      const existingIds = new Set(members.map((m) => m._id));
      setSearchResults(res.data.filter((u) => !existingIds.has(u._id)));
    } catch (err) {
      setMemberError(err?.response?.data?.message || "Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, members]);

  // Add member to project
  const addMember = async (userId) => {
    setMemberLoading(true);
    setMemberError("");
    setMemberSuccess("");
    try {
      const res = await api.post(`/api/projects/${projectId}/members`, { userId, role: "Member" });
      // Update both members and project state with populated data from backend
      if (res.data && res.data.members) {
        setMembers(res.data.members);
        setProject(res.data);
        setMemberSuccess("Member added successfully!");
        // Clear success after 3 seconds
        setTimeout(() => setMemberSuccess(""), 3000);
      }
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to add member";
      setMemberError(errorMsg);
      console.error("Add member error:", err);
    } finally {
      setMemberLoading(false);
    }
  };

  // Remove member from project
  const removeMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setMemberLoading(true);
    setMemberError("");
    setMemberSuccess("");
    try {
      const res = await api.delete(`/api/projects/${projectId}/members/${userId}`);
      // Update both members and project state with populated data from backend
      if (res.data && res.data.members) {
        setMembers(res.data.members);
        setProject(res.data);
        setMemberSuccess("Member removed successfully!");
        setTimeout(() => setMemberSuccess(""), 3000);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to remove member";
      setMemberError(errorMsg);
      console.error("Remove member error:", err);
    } finally {
      setMemberLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!createTitle.trim()) return;
    try {
      const res = await api.post("/api/tasks", {
        title: createTitle.trim(),
        description: createDescription.trim() || "",
        projectId,
        dueDate: createDueDate || null,
      });
      setCreateTitle("");
      setCreateDescription("");
      setCreateDueDate("");
      setTasks((prev) => [res.data, ...prev]);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create task");
    }
  };

  const StatusBadge = ({ status, count }) => {
    const config = {
      Todo: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Circle },
      "In Progress": { color: "bg-blue-100 text-blue-700 border-blue-200", icon: PlayCircle },
      Done: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    };
    const { color, icon: Icon } = config[status] || config.Todo;
    return (
      <div className={`flex items-center gap-1.5 rounded-lg border ${color} px-2.5 py-1`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-semibold">{count}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="truncate text-xl font-bold text-slate-900">
                {project?.title || "Project"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{projectId.slice(-8)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Description */}
      {project?.description && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">Description</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* Members Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Members</h3>
              <span className="text-xs text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          {isAdmin && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
              <Shield className="h-3 w-3" />
              Admin
            </span>
          )}
        </div>

        {/* Current Members List */}
        <div className="mb-4 flex flex-wrap gap-2">
          {!Array.isArray(members) || members.length === 0 ? (
            <div className="w-full rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4 text-center">
              <p className="text-sm text-slate-500">No members in this project yet.</p>
              {isAdmin && <p className="text-xs text-slate-400 mt-1">Add members using the search below.</p>}
            </div>
          ) : (
            members.map((member) => {
              // Safety check - member should be an object with _id, name, email
              if (!member || typeof member !== 'object') return null;
              const memberId = member._id || member.id;
              const memberName = member.name || 'Unknown';
              const memberEmail = member.email || '';
              const isCreator = memberId && (memberId === project?.createdBy?._id || memberId === project?.createdBy);
              
              // Get member role from project roles
              const memberRole = project?.roles?.[memberId] || project?.roles?.[String(memberId)] || "Member";
              const isMemberAdmin = memberRole === "Admin";
              
              return (
                <div
                  key={memberId || Math.random()}
                  className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-all hover:shadow-sm hover:border-slate-300"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-xs font-bold">
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 text-sm">{memberName}</span>
                    <span className="text-xs text-slate-500">{memberEmail}</span>
                  </div>
                  
                  {/* Role Badge */}
                  {isMemberAdmin ? (
                    <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      <User className="h-3 w-3" />
                      Member
                    </span>
                  )}
                  
                  {isCreator && (
                    <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <Crown className="h-3 w-3" />
                      Creator
                    </span>
                  )}
                  
                  {/* Remove button - only for admin and not creator */}
                  {isAdmin && !isCreator && memberId !== user?._id && (
                    <button
                      onClick={() => removeMember(memberId)}
                      disabled={memberLoading}
                      className="ml-1 rounded-lg p-1.5 text-rose-500 hover:bg-rose-100 transition-colors disabled:opacity-50"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Member Section (Admin only) */}
        {isAdmin && (
          <div className="border-t border-slate-200 pt-4">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Search className="h-4 w-4 text-indigo-500" />
              Add Member
              <span className="text-xs font-normal text-slate-500">(search by name or email)</span>
            </label>
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type at least 2 characters to search..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>

            {/* Search Results */}
            {Array.isArray(searchResults) && searchResults.length > 0 && (
              <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                {searchResults.map((u) => {
                  if (!u || typeof u !== 'object') return null;
                  const userId = u._id || u.id;
                  const userName = u.name || 'Unknown';
                  const userEmail = u.email || '';
                  
                  return (
                    <div
                      key={userId || Math.random()}
                      className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-white text-xs font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{userName}</div>
                          <div className="text-xs text-slate-500">{userEmail}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => addMember(userId)}
                        disabled={memberLoading || !userId}
                        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                <UserCircle className="h-4 w-4" />
                No users found. Try a different search term.
              </div>
            )}
          </div>
        )}

        {memberError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4" />
            {memberError}
          </div>
        )}
        
        {memberSuccess && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {memberSuccess}
          </div>
        )}
      </section>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Create Task Section */}
      {isAdmin ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600">
              <Plus className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Create New Task</h3>
          </div>
          <form onSubmit={createTask} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold text-slate-700">Task Title</label>
              <input
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold text-slate-700">Description</label>
              <textarea
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                placeholder="Enter task description (optional)"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Due Date
              </label>
              <input
                value={createDueDate}
                onChange={(e) => setCreateDueDate(e.target.value)}
                type="date"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <UserCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Member Access</p>
            <p className="text-xs text-slate-600 mt-0.5">
              You can view tasks and update your assigned task status. Only <span className="font-semibold text-indigo-600">Admins</span> can create or assign tasks.
            </p>
          </div>
        </section>
      )}

      {/* Tasks Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tasks</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{tasks.length} total</span>
            <div className="flex gap-1.5">
              <StatusBadge status="Todo" count={counts.Todo} />
              <StatusBadge status="In Progress" count={counts["In Progress"]} />
              <StatusBadge status="Done" count={counts.Done} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm text-slate-500">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No tasks yet</p>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin ? "Create your first task above!" : "Tasks will appear here once created by admin."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((t) => {
              // Determine if user can change status: admin OR assigned user
              const assignedToId = t.assignedTo?._id || t.assignedTo;
              const isAssigned = assignedToId && String(assignedToId) === String(user?._id);
              const canChangeStatus = isAdmin || isAssigned;
              
              return (
                <TaskCard
                  key={t._id}
                  task={t}
                  members={members}
                  onStatusChange={onStatusChange}
                  onAssign={onAssign}
                  canAssign={isAdmin}
                  canChangeStatus={canChangeStatus}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

