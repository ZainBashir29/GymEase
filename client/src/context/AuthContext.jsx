import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data } = await api.get("/auth/current-user");
        if (isMounted) {
          setUser(data.data);
        }
      } catch (err) {
        if (isMounted) {
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

  const isSystemAdmin = user?.adminType === "system_admin";
  
  const hasPermission = (perm) => {
    if (isSystemAdmin) return true;
    if (user?.permissions?.includes(perm)) return true;
    if ((perm === "manage_products" || perm === "manage_orders") && user?.permissions?.includes("manage_store")) return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isSystemAdmin, hasPermission }}>
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
