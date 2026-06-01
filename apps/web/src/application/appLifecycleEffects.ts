import { useEffect } from "react";
import type {
  ApiRuntimeInfo,
  AuthSession
} from "../types/appRuntime.js";
import type { AuditEvent } from "../types/audit.js";

type AppLifecycleEffectsConfig = {
  readonly actorRole: AuthSession["actor"]["role"] | undefined;
  readonly canReadAudit: boolean;
  readonly canViewRuntimeInfo: boolean;
  readonly clearPatientWorkspaceState: () => void;
  readonly isAuthenticated: boolean;
  readonly isIntegrationSession: boolean;
  readonly loadApiRuntimeInfo: () => Promise<void>;
  readonly loadCapabilityStatement: () => Promise<void>;
  readonly loadGlobalAuditEvents: (
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadPatients: () => Promise<void>;
  readonly loadPatientWorkspace: (patientId: string) => Promise<void>;
  readonly loadProviderDirectory: () => Promise<void>;
  readonly selectedPatientId: string | undefined;
  readonly setApiRuntimeInfo: (info: ApiRuntimeInfo | undefined) => void;
  readonly setApiRuntimeWarning: (message: string | undefined) => void;
  readonly setGlobalAuditEvents: (events: readonly AuditEvent[]) => void;
};

export function useAppLifecycleEffects(config: AppLifecycleEffectsConfig) {
  useEffect(() => {
    if (!config.isAuthenticated) {
      return;
    }

    if (config.isIntegrationSession) {
      void config.loadCapabilityStatement();
      return;
    }

    void config.loadPatients();
    void config.loadCapabilityStatement();
    if (config.canViewRuntimeInfo) {
      void config.loadApiRuntimeInfo();
    } else {
      config.setApiRuntimeInfo(undefined);
      config.setApiRuntimeWarning(undefined);
    }
    void config.loadProviderDirectory();
  }, [
    config.canViewRuntimeInfo,
    config.isAuthenticated,
    config.isIntegrationSession
  ]);

  useEffect(() => {
    if (!config.isAuthenticated || !config.canReadAudit) {
      config.setGlobalAuditEvents([]);
      return;
    }

    void config.loadGlobalAuditEvents({ silent: true });
  }, [config.isAuthenticated, config.actorRole]);

  useEffect(() => {
    if (!config.isAuthenticated || !config.selectedPatientId) {
      config.clearPatientWorkspaceState();
      return;
    }

    void config.loadPatientWorkspace(config.selectedPatientId);
  }, [config.isAuthenticated, config.selectedPatientId]);
}
