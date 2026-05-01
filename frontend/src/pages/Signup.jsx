import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Users, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ClipboardList
} from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ name, email, password, role });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white lg:flex lg:flex-col lg:justify-between shadow-xl">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Get started</h1>
          <p className="mt-3 text-indigo-100">
            Join thousands of teams using TaskFlow to manage projects and tasks efficiently.
          </p>
        </div>
        <div className="space-y-3 rounded-xl bg-white/10 backdrop-blur p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm">Free to use</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm">Unlimited projects</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm">Real-time collaboration</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-600">TaskFlow</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
          <p className="mt-1 text-sm text-slate-500">Start your journey with us today</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <User className="h-4 w-4 text-slate-400" />
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Mail className="h-4 w-4 text-slate-400" />
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Lock className="h-4 w-4 text-slate-400" />
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              placeholder="Minimum 8 characters recommended"
            />
          </div>
          
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              {role === "Admin" ? <Shield className="h-4 w-4 text-slate-400" /> : <Users className="h-4 w-4 text-slate-400" />}
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 appearance-none cursor-pointer"
            >
              <option value="Member">👤 Team Member</option>
              <option value="Admin">👑 Admin (Create projects)</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

