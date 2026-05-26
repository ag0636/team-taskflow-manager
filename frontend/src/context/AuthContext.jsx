import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import API from "../api/axios";
import { getToken, removeToken, saveToken } from "../utils/token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const storedToken = getToken();

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const { data } = await API.get("/auth/me");
      setUser(data);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser, token]);

  const login = async ({ email, password }) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const { data } = await API.post("/auth/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!data.access_token) {
      throw new Error("Login response did not include an access token");
    }

    saveToken(data.access_token);
    setToken(data.access_token);

    const me = await API.get("/auth/me");
    setUser(me.data);
    toast.success("Welcome back");
    navigate("/dashboard", { replace: true });
  };

  const signup = async ({ fullName, email, password, role }) => {
    await API.post("/auth/signup", {
      full_name: fullName,
      email,
      password,
      role,
    });

    toast.success("Account created");
    await login({ email, password });
  };

  const logout = () => {
    clearSession();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
