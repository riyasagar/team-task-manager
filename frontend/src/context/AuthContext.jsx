import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

const TOKEN_KEY = "ttm_token";
const USER_KEY = "ttm_user";

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem(USER_KEY)));

  // Save token
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  // Save user
  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  // ✅ FIXED: Removed extra /api
  const signup = async ({ name, email, password, role }) => {
    const res = await api.post("/auth/signup", {
      name,
      email,
      password,
      role,
    });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  // ✅ FIXED: Removed extra /api
  const login = async ({ email, password }) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      signup,
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

