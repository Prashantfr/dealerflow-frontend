import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../api/appointments";
import { AUTH_KEY } from "../api/client";

const AuthContext = createContext(null);

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_KEY));
    return saved?.token && saved?.user ? saved : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readSaved);
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuth(null);
  }, []);

  useEffect(() => {
    const onExpired = () => {
      localStorage.removeItem(AUTH_KEY);
      setAuth(null);
      setSessionExpired(true);
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password);
    const saved = { token: data.token, user: data.user };
    localStorage.setItem(AUTH_KEY, JSON.stringify(saved));
    setSessionExpired(false);
    setAuth(saved);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user: auth?.user ?? null, login, logout, sessionExpired }),
    [auth, login, logout, sessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
