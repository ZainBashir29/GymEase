import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthContext] effect fired — checking /current-user");
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data } = await api.get("/auth/current-user");
        if (isMounted) {
          console.log("[AuthContext] /auth/current-user resolved:", data.data);
          setUser(data.data);
        }
      } catch (err) {
        if (isMounted) {
          console.log(
            "[AuthContext] /auth/current-user failed:",
            err.response?.status,
          );
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData) => setUser(userData);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
