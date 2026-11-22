import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("atithya_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem("atithya_user", JSON.stringify(user));
    else localStorage.removeItem("atithya_user");
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem("atithya_token", data.token);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name, email, password, phone = "") => {
    setLoading(true);
    try {
      const data = await authService.register({ name, email, password, phone });
      localStorage.setItem("atithya_token", data.token);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const data = await authService.getMe();
      setUser((prev) => ({ ...prev, ...data }));
      return data;
    } catch {
      return null;
    }
  };

  const toggleFavorite = async (menuItemId) => {
    const res = await authService.toggleFavorite(menuItemId);
    setUser((prev) => (prev ? { ...prev, favorites: res.favorites } : prev));
    return res;
  };

  const logout = () => {
    localStorage.removeItem("atithya_token");
    localStorage.removeItem("atithya_user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isKitchen = user?.role === "kitchen" || user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        registerUser,
        refreshProfile,
        toggleFavorite,
        logout,
        loading,
        isAdmin,
        isKitchen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
