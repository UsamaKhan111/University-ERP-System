import { createContext, useCallback, useContext, useMemo, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (_error) {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(readStoredUser);

  const saveSession = useCallback((authPayload) => {
    localStorage.setItem("token", authPayload.token);
    localStorage.setItem("user", JSON.stringify(authPayload.user));
    setToken(authPayload.token);
    setUser(authPayload.user);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await api.post("/api/auth/login", credentials);
      saveSession(response.data.data);
      return response.data.data;
    },
    [saveSession]
  );

  const register = useCallback(
    async (payload) => {
      const response = await api.post("/api/auth/register", payload);
      saveSession(response.data.data);
      return response.data.data;
    },
    [saveSession]
  );

  const refreshProfile = useCallback(async () => {
    const response = await api.get("/api/auth/profile");
    const nextUser = response.data.data.user;
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshProfile,
      register,
      token,
      user
    }),
    [login, logout, refreshProfile, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
