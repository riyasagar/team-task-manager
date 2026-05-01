import { useState } from "react";
import { 
  Clock, 
  Calendar, 
  User, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  AlertCircle,
  FileText,
  ChevronDown
} from "lucide-react";

export default function TaskCard({ task, members, onStatusChange, onAssign, canAssign = true, canChangeStatus = true }) {
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due && due.getTime() < Date.now() && task.status !== "Done";

  const statusConfig = {
    Todo: {
      color: "bg-amber-50 border-amber-200 text-amber-700",
      icon: Circle,
      dot: "bg-amber-500",
      label: "To Do"
    },
    "In Progress": {
      color: "bg-blue-50 border-blue-200 text-blue-700",
      icon: PlayCircle,
      dot: "bg-blue-500",
      label: "In Progress"
    },
    Done: {
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: CheckCircle2,
      dot: "bg-emerald-500",
      label: "Done"
    },
  };

  const status = statusConfig[task.status] || statusConfig.Todo;
  const StatusIcon = status.icon;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          {task.project?.title && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-indigo-600">
              <FileText className="h-3.5 w-3.5" />
              {task.project.title}
            </div>
          )}
          <h4 className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
            {task.title}
          </h4>
        </div>
        <div className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.color}`}>
          <div className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
        </div>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed mb-4">
        {task.description || "No description provided"}
      </p>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
        {/* Due Date */}
        <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? "text-rose-600" : "text-slate-500"}`}>
          <Calendar className={`h-3.5 w-3.5 ${isOverdue ? "text-rose-500" : ""}`} />
          {due ? (
            <>
              {due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              {isOverdue && <span className="text-rose-500 font-bold">• Overdue</span>}
            </>
          ) : (
            <span>No due date</span>
          )}
        </div>

        {/* Assigned - Interactive for Admins */}
        {onAssign && canAssign && Array.isArray(members) && members.length > 0 ? (
          <div 
            className="relative"
            onMouseEnter={() => setShowAssignDropdown(true)}
            onMouseLeave={() => setShowAssignDropdown(false)}
          >
            <div className="flex items-center gap-1.5 text-slate-500 cursor-pointer hover:text-indigo-600 transition-colors">
              <User className="h-3.5 w-3.5" />
              <span className={task.assignedTo ? "text-slate-700 font-medium" : "text-slate-400 italic"}>
                {task.assignedTo?.name || "Unassigned"}
              </span>
              <ChevronDown className="h-3 w-3" />
            </div>
            
            {/* Assign Dropdown */}
            {showAssignDropdown && (
              <div className="absolute left-0 top-full mt-1 z-20 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Assign to...
                </p>
                <button
                  onClick={() => {
                    onAssign(task, "");
                    setShowAssignDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${!task.assignedTo ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                >
                  <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="h-3 w-3 text-slate-500" />
                  </div>
                  Unassigned
                  {!task.assignedTo && <CheckCircle2 className="h-3.5 w-3.5 ml-auto" />}
                </button>
                {members.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => {
                      onAssign(task, m._id);
                      setShowAssignDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${task.assignedTo?._id === m._id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                  >
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-xs font-bold flex items-center justify-center">
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                    {m.name}
                    {task.assignedTo?._id === m._id && <CheckCircle2 className="h-3.5 w-3.5 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Read-only for non-admins */
          <div className="flex items-center gap-1.5 text-slate-500">
            <User className="h-3.5 w-3.5" />
            <span className={task.assignedTo ? "text-slate-700 font-medium" : "text-slate-400 italic"}>
              {task.assignedTo?.name || "Unassigned"}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {((onStatusChange && canChangeStatus) || (onAssign && canAssign)) && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {onStatusChange && canChangeStatus && (
            <div className="relative">
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task, e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 focus:ring-2 focus:ring-indigo-200 transition-colors cursor-pointer"
              >
                <option value="Todo">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <StatusIcon className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          )}
          {onAssign && canAssign && Array.isArray(members) && members.length > 0 && (
            <div className="relative">
              <select
                value={task.assignedTo?._id || ""}
                onChange={(e) => onAssign(task, e.target.value)}
                className="appearance-none min-w-32 rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 focus:ring-2 focus:ring-indigo-200 transition-colors cursor-pointer"
              >
                <option value="">👤 Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <User className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

