"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface User {
  id: string;
  full_name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setSession: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("atelier_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.auth
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("atelier_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setSession = (token: string, nextUser: User) => {
    localStorage.setItem("atelier_token", token);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("atelier_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);