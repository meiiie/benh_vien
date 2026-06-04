import { lazy, Suspense, type FormEvent } from "react";
import { createClinicalApiClient } from "./api/clinicalApi.js";
import { loginDemoSession } from "./auth/authApi.js";
import { formatDateTime } from "./lib/clinicalFormatters.js";
import { useAppShellState } from "./application/appShellState.js";
import { normalizeAuthenticatedRoute } from "./config/appNavigation.js";
import { PublicAppExperience } from "./pages/PublicAppExperience.js";

const AuthenticatedAppContainer = lazy(
  () => import("./pages/AuthenticatedAppContainer.js")
);

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (window.location.port === "7311" ? "http://localhost:7310/api/v1" : "/api/v1");

export function App() {
  const {
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
  } = useAppShellState();
  const publicApi = createClinicalApiClient({
    baseUrl: apiBaseUrl,
    getSession: () => authSession
  });

  async function handleLogin(event?: FormEvent<HTMLFormElement>) {
    const shouldOpenLoginOnFailure = !event;

    event?.preventDefault();

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError("Vui lòng nhập tài khoản và mật khẩu demo.");
      return;
    }

    try {
      setLoginError(undefined);
      setStatusMessage("Đang xác thực phiên đăng nhập...");

      const session = await loginDemoSession(publicApi, loginForm);
      setAuthSession(session);
      setIsAuthenticated(true);
      setAppRoute(session.actor.role === "auditor" ? "audit" : "dashboard");
      setStatusMessage(
        `Đã đăng nhập ${session.actor.displayName}; phiên hết hạn ${formatDateTime(session.expiresAt)}.`
      );
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Không thể đăng nhập phiên demo."
      );
      setStatusMessage("Đăng nhập thất bại.");

      if (shouldOpenLoginOnFailure) {
        setAppRoute("login");
      }
    }
  }

  if (!isAuthenticated || !authSession) {
    return (
      <PublicAppExperience
        appRoute={appRoute}
        loginError={loginError}
        loginForm={loginForm}
        onBackToLanding={() => setAppRoute("landing")}
        onDemo={() => void handleLogin()}
        onLogin={() => setAppRoute("login")}
        onLoginFormChange={setLoginForm}
        onLoginSubmit={handleLogin}
      />
    );
  }

  const isIntegrationSession = authSession.actor.role === "integration";
  const authenticatedAppRoute = isIntegrationSession
    ? "interop"
    : normalizeAuthenticatedRoute(appRoute);

  return (
    <Suspense
      fallback={
        <main className="app-loading-shell" role="status">
          Đang mở không gian bệnh án...
        </main>
      }
    >
      <AuthenticatedAppContainer
        apiBaseUrl={apiBaseUrl}
        appRoute={authenticatedAppRoute}
        authSession={authSession}
        isIntegrationSession={isIntegrationSession}
        loginForm={loginForm}
        setAppRoute={setAppRoute}
        setAuthSession={setAuthSession}
        setIsAuthenticated={setIsAuthenticated}
        setLoginError={setLoginError}
        setStatusMessage={setStatusMessage}
        statusMessage={statusMessage}
      />
    </Suspense>
  );
}
