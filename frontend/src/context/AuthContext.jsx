"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authService } from "@/services/auth.service";
import { configureApi } from "@/services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep the latest token available synchronously.
  // This prevents API requests from seeing an old/null token
  // during React's effect timing.
  const accessTokenRef = useRef(null);

  accessTokenRef.current = accessToken;

  useEffect(() => {
    configureApi({
      tokenGetter: () => accessTokenRef.current,
    });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await authService.refresh();

      if (!data?.accessToken) {
        accessTokenRef.current = null;
        setAccessToken(null);

        return null;
      }

      accessTokenRef.current = data.accessToken;
      setAccessToken(data.accessToken);

      return data.accessToken;
    } catch {
      accessTokenRef.current = null;
      setAccessToken(null);

      return null;
    }
  }, []);

  useEffect(() => {
    async function initializeAuth() {
      const token = await refresh();

      if (token) {
        const savedUser =
          sessionStorage.getItem("kanban_user");

        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            sessionStorage.removeItem("kanban_user");
            setUser(null);
          }
        }
      } else {
        sessionStorage.removeItem("kanban_user");
        setUser(null);
      }

      setLoading(false);
    }

    initializeAuth();
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);

    accessTokenRef.current = data.accessToken;
    setAccessToken(data.accessToken);

    setUser(data.user);

    sessionStorage.setItem(
      "kanban_user",
      JSON.stringify(data.user),
    );

    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout(accessTokenRef.current);
    } finally {
      accessTokenRef.current = null;

      setAccessToken(null);
      setUser(null);

      sessionStorage.removeItem("kanban_user");
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      logout,
      refresh,
      setUser,
    }),
    [
      user,
      accessToken,
      loading,
      login,
      logout,
      refresh,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}