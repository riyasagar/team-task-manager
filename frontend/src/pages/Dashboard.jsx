import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Plus,
  FolderOpen,
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  AlertCircle,
  Users,
  X,
  Loader2,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Stats calculations
  const stats = useMemo(() => {
    const byStatus = { Todo: 0, "In Progress": 0, Done: 0 };
    allTasks.forEach((t) => {
      if (byStatus[t.status] !== undefined) byStatus[t.status] += 1;
    });
    return {
      total: allTasks.length,
      ...byStatus,
    };
  }, [allTasks]);

  const myStats = useMemo(() => {
    const byStatus = { Todo: 0, "In Progress": 0, Done: 0 };
    myAssignedTasks.forEach((t) => {
      if (byStatus[t.status] !== undefined) byStatus[t.status] += 1;
    });
    return {
      total: myAssignedTasks.length,
      ...byStatus,
    };
  }, [myAssignedTasks]);

  const tasksByStatus = useMemo(() => {
    const groups = { Todo: [], "In Progress": [], Done: [] };
    allTasks.forEach((t) => {
      if (!groups[t.status]) groups[t.status] = [];
      groups[t.status].push(t);
    });
    return groups;
  }, [allTasks]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [pRes, tRes, aRes, oRes] = await Promise.all([
        api.get("/api/projects/my"),
        api.get("/api/tasks/my"),
        api.get("/api/tasks/my-assigned"),
        api.get("/api/tasks/overdue"),
      ]);
      setProjects(pRes.data || []);
      setAllTasks(tRes.data || []);
      setMyAssignedTasks(aRes.data || []);
      setOverdue(oRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Handle task status change from Dashboard
  const onStatusChange = async (task, newStatus) => {
    try {
      const res = await api.patch(`/api/tasks/${task._id}/status`, { status: newStatus });
      // Update all task lists with the updated task
      const updatedTask = res.data;
      setAllTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
      setMyAssignedTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
      setOverdue((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert(err?.response?.data?.message || "Failed to update task status");
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!createTitle.trim()) {
      setCreateError("Title is required");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await api.post("/api/projects", {
        title: createTitle.trim(),
        description: createDescription.trim() || "",
      });
      setProjects((prev) => [res.data, ...prev]);
      setShowCreateModal(false);
      setCreateTitle("");
      setCreateDescription("");
    } catch (err) {
      setCreateError(err?.response?.data?.message || "Failed to create project");
    } finally {
      setCreateLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, gradient, delay = 0 }) => (
    <div 
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${delay}`}
    >
      <div className={`absolute right-0 top-0 h-24 w-24 opacity-10 ${gradient}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${gradient} text-white shadow-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const StatusColumn = ({ status, tasks, icon: Icon, color, bgColor, borderColor, onStatusChange }) => (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex items-center gap-2 rounded-xl ${bgColor} border ${borderColor} px-3 py-2`}>
          <Icon className={`h-4 w-4 ${color}`} />
          <span className={`text-sm font-bold ${color}`}>{status}</span>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-3">
        {tasks.slice(0, 4).map((t) => {
          const assignedToId = t.assignedTo?._id || t.assignedTo;
          const isAssigned = assignedToId && String(assignedToId) === String(user?._id);
          const canChangeStatus = isAdmin || isAssigned;
          return (
            <TaskCard 
              key={t._id} 
              task={t} 
              onStatusChange={onStatusChange}
              canChangeStatus={canChangeStatus}
              members={[]}
            />
          );
        })}
        {tasks.length > 4 && (
          <div className="rounded-xl bg-white p-3 text-center text-xs font-medium text-slate-500 shadow-sm">
            +{tasks.length - 4} more
          </div>
        )}
        {tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-center">
            <p className="text-xs text-slate-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          </div>
          <p className="text-sm text-slate-500">Welcome back! Here's your project overview</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Task Overview</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Tasks" 
                value={stats.total} 
                icon={LayoutDashboard}
                color="text-indigo-700"
                gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
              />
              <StatCard 
                title="To Do" 
                value={stats.Todo} 
                icon={Circle}
                color="text-amber-600"
                gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              />
              <StatCard 
                title="In Progress" 
                value={stats["In Progress"]} 
                icon={PlayCircle}
                color="text-blue-600"
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
              <StatCard 
                title="Completed" 
                value={stats.Done} 
                icon={CheckCircle2}
                color="text-emerald-600"
                gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
              />
            </div>
          </section>

          {/* My Assigned Tasks Stats */}
          {myAssignedTasks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">My Work</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                  title="Assigned to Me" 
                  value={myStats.total} 
                  icon={Users}
                  color="text-slate-700"
                  gradient="bg-gradient-to-br from-slate-500 to-slate-600"
                />
                <StatCard 
                  title="My Todo" 
                  value={myStats.Todo} 
                  icon={Circle}
                  color="text-amber-600"
                  gradient="bg-gradient-to-br from-amber-400 to-orange-500"
                />
                <StatCard 
                  title="My In Progress" 
                  value={myStats["In Progress"]} 
                  icon={PlayCircle}
                  color="text-blue-600"
                  gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                />
                <StatCard 
                  title="My Done" 
                  value={myStats.Done} 
                  icon={CheckCircle2}
                  color="text-emerald-600"
                  gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
                />
              </div>
            </section>
          )}

          {/* Projects Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Your Projects</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {projects.length} total
              </span>
            </div>
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <FolderOpen className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">
                  {isAdmin ? "No projects yet. Create your first project!" : "No projects yet. Ask an admin to add you."}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Create Your First Project
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            )}
          </section>

          {/* Tasks by Status - Kanban Style */}
          {allTasks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Tasks by Status</h3>
                <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  {allTasks.length} tasks
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <StatusColumn
                  status="To Do"
                  tasks={tasksByStatus["Todo"] || []}
                  icon={Circle}
                  color="text-amber-700"
                  bgColor="bg-amber-50"
                  borderColor="border-amber-200"
                  onStatusChange={onStatusChange}
                />
                <StatusColumn
                  status="In Progress"
                  tasks={tasksByStatus["In Progress"] || []}
                  icon={PlayCircle}
                  color="text-blue-700"
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                  onStatusChange={onStatusChange}
                />
                <StatusColumn
                  status="Done"
                  tasks={tasksByStatus["Done"] || []}
                  icon={CheckCircle2}
                  color="text-emerald-700"
                  bgColor="bg-emerald-50"
                  borderColor="border-emerald-200"
                  onStatusChange={onStatusChange}
                />
              </div>
            </section>
          )}

          {/* My Assigned Tasks */}
          {myAssignedTasks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Tasks Assigned to You</h3>
                <span className="ml-auto rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                  {myAssignedTasks.length} tasks
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myAssignedTasks.map((t) => (
                  <TaskCard 
                    key={t._id} 
                    task={t} 
                    onStatusChange={onStatusChange}
                    canChangeStatus={true}
                    members={[]}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Overdue Tasks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              <h3 className="text-lg font-bold text-rose-700">Overdue Tasks</h3>
              {overdue.length > 0 && (
                <span className="ml-auto rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700">
                  {overdue.length} tasks
                </span>
              )}
            </div>
            {overdue.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800">All caught up!</p>
                  <p className="text-sm text-emerald-600">No overdue tasks. Great job!</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {overdue.map((t) => {
                  const assignedToId = t.assignedTo?._id || t.assignedTo;
                  const isAssigned = assignedToId && String(assignedToId) === String(user?._id);
                  const canChangeStatus = isAdmin || isAssigned;
                  return (
                    <TaskCard 
                      key={t._id} 
                      task={t} 
                      onStatusChange={onStatusChange}
                      canChangeStatus={canChangeStatus}
                      members={[]}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create New Project</h3>
                  <p className="text-xs text-slate-500">Start a new team project</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Project Title *</label>
                <input
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Enter project description (optional)"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition-all"
                />
              </div>

              {createError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  {createError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

