import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, ArrowRight, FolderOpen, Calendar, Shield, User } from "lucide-react";

export default function ProjectCard({ project }) {
  const [showMembersTooltip, setShowMembersTooltip] = useState(false);

  // Get member role from project roles map
  const getMemberRole = (memberId) => {
    if (!project.roles) return "Member";
    const role = project.roles[memberId] || project.roles[String(memberId)];
    return role || "Member";
  };

  return (
    <Link to={`/projects/${project._id}`} className="block group">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1">
        {/* Gradient accent */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-violet-500 opacity-0 transition-opacity group-hover:opacity-100" />
        
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600">
                <FolderOpen className="h-4 w-4" />
              </div>
              <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                {project.title}
              </h3>
            </div>
            <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed">
              {project.description || "No description provided"}
            </p>
          </div>
          
          {/* Members count with hover tooltip */}
          <div 
            className="relative shrink-0"
            onMouseEnter={() => setShowMembersTooltip(true)}
            onMouseLeave={() => setShowMembersTooltip(false)}
          >
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 px-3 py-1.5 cursor-pointer hover:border-emerald-300 transition-colors">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                {project.members?.length ?? 0}
              </span>
            </div>
            
            {/* Members Tooltip */}
            {showMembersTooltip && project.members && project.members.length > 0 && (
              <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-slate-200 bg-white shadow-lg p-3">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Project Members</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {project.members.map((member) => {
                    const memberId = member._id || member.id;
                    const memberName = member.name || "Unknown";
                    const role = getMemberRole(memberId);
                    const isAdmin = role === "Admin";
                    
                    return (
                      <div key={memberId} className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-xs font-bold">
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{memberName}</p>
                        </div>
                        {isAdmin ? (
                          <span className="flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                            <User className="h-3 w-3" />
                            Member
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created {new Date(project.createdAt).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
          <span className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors group-hover:bg-indigo-100">
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

