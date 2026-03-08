import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;

export const AuthContext = createContext(null);

/** Hook for consuming auth state anywhere in the app */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

/**
 * AuthProvider — wraps the entire app.
 * On mount, calls GET /api/auth/me to verify the httpOnly cookie.
 * State:
 *   user    — null (logged out) | user object (logged in)
 *   loading — true while the initial /me check is in flight
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  /* ── Verify session on every page load / refresh ── */
  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me");
        if (!cancelled) setUser(res.data.user);
      } catch {
        // 401 → not logged in, keep user = null
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    verify();
    return () => { cancelled = true; };
  }, []);

  /* ── Called after a successful login / Google login ── */
  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  /* ── Called on logout click ── */
  const logout = useCallback(async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout");
    } catch {
      // Even if request fails, clear local state
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
