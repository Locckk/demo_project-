import { createContext, useContext, useEffect, useState } from "react";
import { users as seedUsers } from "../data/dummyData.js";

/**
 * AUTHENTICATION.
 * OWNER: Dev A — nobody else edits this file.
 *
 * Staff accounts live in the data store, so read the saved list: an employee
 * added on the Users page can then sign in straight away.
 */
const staffAccounts = () => {
  try {
    const raw = localStorage.getItem("srms_staff");
    return raw ? JSON.parse(raw) : seedUsers;
  } catch {
    return seedUsers;
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("srms_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("srms_user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Dummy login. When the backend is ready:
   *   const { data } = await authService.login({ email, password });
   *   localStorage.setItem("srms_token", data.token);
   */
  const login = async ({ email, password, remember }) => {
    await new Promise((r) => setTimeout(r, 600));

    const found = staffAccounts().find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!found) throw new Error("That email and password don't match an account.");
    if (found.status !== "Active") {
      throw new Error("This account is inactive. Ask an admin to enable it.");
    }

    const session = { id: found.id, name: found.name, email: found.email, role: found.role };
    setUser(session);
    localStorage.setItem("srms_user", JSON.stringify(session));
    localStorage.setItem("srms_token", "demo-token");
    if (remember) localStorage.setItem("srms_remember", found.email);
    else localStorage.removeItem("srms_remember");
    return session;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("srms_user");
    localStorage.removeItem("srms_token");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>.");
  return ctx;
}
