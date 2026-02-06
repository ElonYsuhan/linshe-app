import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const login = (username: string, password: string) => {
    // ✅ 默认账号密码（示例）
    if (username === "admin" && password === "123456") {
      setLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
