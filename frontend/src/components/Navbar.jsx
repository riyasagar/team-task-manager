import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  LogOut, 
  UserCircle, 
  Shield, 
  Users,
  ClipboardList,
  CheckCircle2
} from "lucide-react";

function navClass({ isActive }) {
  return [
    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
    isActive 
      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200" 
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
              TaskFlow
            </span>
            <p className="text-xs text-slate-500 -mt-0.5">Team Manager</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
            
            {/* User Badge */}
            <div className="hidden md:flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 ml-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</span>
                  <div className="flex items-center gap-1">
                    {user?.role === "Admin" ? (
                      <Shield className="h-3 w-3 text-amber-500" />
                    ) : (
                      <Users className="h-3 w-3 text-blue-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      user?.role === "Admin" ? "text-amber-600" : "text-blue-600"
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="ml-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-all hover:bg-rose-100 hover:shadow-md"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navClass}>
              <UserCircle className="h-4 w-4" />
              <span>Login</span>
            </NavLink>
            <NavLink to="/signup" className={navClass}>
              <CheckCircle2 className="h-4 w-4" />
              <span>Signup</span>
            </NavLink>
          </>
        )}
      </nav>
      </div>
    </header>
  );
}

