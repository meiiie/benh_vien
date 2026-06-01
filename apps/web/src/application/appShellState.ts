import { useState } from "react";
import { loginPresets, type LoginForm } from "../auth/demoLogin.js";
import type { AppRoute, AuthSession } from "../types/appRuntime.js";

export function useAppShellState() {
  const [appRoute, setAppRoute] = useState<AppRoute>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession>();
  const [loginForm, setLoginForm] = useState<LoginForm>(loginPresets.clinician);
  const [loginError, setLoginError] = useState<string>();
  const [statusMessage, setStatusMessage] = useState("Chưa đăng nhập.");

  return {
    appRoute,
    authSession,
    isAuthenticated,
    loginError,
    loginForm,
    setAppRoute,
    setAuthSession,
    setIsAuthenticated,
    setLoginError,
    setLoginForm,
    setStatusMessage,
    statusMessage
  };
}
