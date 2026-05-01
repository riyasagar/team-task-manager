import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ClipboardList
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white lg:flex lg:flex-col lg:justify-between shadow-xl">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Welcome back</h1>
          <p className="mt-3 text-indigo-100">
            Login to manage projects, assign tasks, and track team progress.
          </p>
        </div>
        <div className="rounded-xl bg-white/10 backdrop-blur p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm">Streamline your workflow</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm">Collaborate with your team</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="text-sm">Track progress in real-time</span>
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
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
              placeholder="••••••••"
            />
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
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" to="/signup">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

