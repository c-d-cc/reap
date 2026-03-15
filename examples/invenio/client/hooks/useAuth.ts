import { useState, useCallback } from "react";
import { apiFetch, setToken, clearToken } from "../api";
import type { AuthResponse, User } from "../../shared/types";

function loadUser(): User | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<AuthResponse>("/auth/sign-in", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    },
    []
  );

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const data = await apiFetch<AuthResponse>("/auth/sign-up", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const isAuthenticated = user !== null && localStorage.getItem("token") !== null;

  return { user, isAuthenticated, login, signup, logout };
}
