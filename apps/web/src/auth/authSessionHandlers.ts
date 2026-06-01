import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../api/clinicalApi.js";
import { formatDateTime } from "../lib/clinicalFormatters.js";
import type { ApiRuntimeInfo, AppRoute, AuthSession } from "../types/appRuntime.js";
import type { AuditEvent } from "../types/audit.js";
import type { Patient } from "../types/patientRegistry.js";
import type { ProviderDirectory } from "../types/providerDirectory.js";
import { loginDemoSession } from "./authApi.js";
import type { LoginForm } from "./demoLogin.js";

type AuthSessionHandlerConfig = {
  readonly clearPatientWorkspaceState: () => void;
  readonly clinicalApi: ClinicalApiClient;
  readonly loginForm: LoginForm;
  readonly setApiRuntimeInfo: (info: ApiRuntimeInfo | undefined) => void;
  readonly setApiRuntimeWarning: (message: string | undefined) => void;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setAuthSession: (session: AuthSession | undefined) => void;
  readonly setGlobalAuditEvents: (events: readonly AuditEvent[]) => void;
  readonly setIsAuthenticated: (isAuthenticated: boolean) => void;
  readonly setLoginError: (message: string | undefined) => void;
  readonly setPatients: (patients: readonly Patient[]) => void;
  readonly setProviderDirectory: (directory: ProviderDirectory | undefined) => void;
  readonly setProviderDirectoryFhirPreview: (preview: unknown) => void;
  readonly setSelectedPatientId: (patientId: string | undefined) => void;
  readonly setStatusMessage: (message: string) => void;
  readonly setTransitioningRecordTransferId: (
    recordTransferId: string | undefined
  ) => void;
};

export function buildAuthSessionHandlers(config: AuthSessionHandlerConfig) {
  return {
    handleLogin: async (event?: FormEvent<HTMLFormElement>) => {
      const shouldOpenLoginOnFailure = !event;

      event?.preventDefault();

      if (!config.loginForm.username.trim() || !config.loginForm.password.trim()) {
        config.setLoginError("Vui lòng nhập tài khoản và mật khẩu demo.");
        return;
      }

      try {
        config.setLoginError(undefined);
        config.setStatusMessage("Đang xác thực phiên đăng nhập...");

        const session = await loginDemoSession(config.clinicalApi, config.loginForm);
        config.setAuthSession(session);
        config.setIsAuthenticated(true);
        config.setAppRoute(session.actor.role === "auditor" ? "audit" : "dashboard");
        config.setStatusMessage(
          `Đã đăng nhập ${session.actor.displayName}; phiên hết hạn ${formatDateTime(session.expiresAt)}.`
        );
      } catch (error) {
        config.setLoginError(
          error instanceof Error
            ? error.message
            : "Không thể đăng nhập phiên demo."
        );
        config.setStatusMessage("Đăng nhập thất bại.");

        if (shouldOpenLoginOnFailure) {
          config.setAppRoute("login");
        }
      }
    },
    handleLogout: () => {
      config.setAuthSession(undefined);
      config.setIsAuthenticated(false);
      config.setAppRoute("landing");
      config.setStatusMessage("Đã đăng xuất khỏi phiên demo.");
      config.setPatients([]);
      config.clearPatientWorkspaceState();
      config.setGlobalAuditEvents([]);
      config.setApiRuntimeInfo(undefined);
      config.setApiRuntimeWarning(undefined);
      config.setProviderDirectory(undefined);
      config.setProviderDirectoryFhirPreview(undefined);
      config.setSelectedPatientId(undefined);
      config.setTransitioningRecordTransferId(undefined);
    }
  };
}
