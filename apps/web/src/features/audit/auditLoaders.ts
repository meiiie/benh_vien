import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import { formatAuditIntegrityReason } from "../../lib/auditFormatters.js";
import type { AuditEvent, AuditIntegrityReport } from "../../types/clinical.js";
import {
  listGlobalAuditEvents,
  listPatientAuditEvents,
  verifyPatientAuditIntegrity
} from "./auditApi.js";

type AuditLoaderOptions = {
  readonly silent?: boolean;
};

type AuditLoaderConfig = {
  readonly canReadAudit: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly setAuditEvents: (events: readonly AuditEvent[]) => void;
  readonly setAuditFhirBundlePreview: (preview: unknown) => void;
  readonly setAuditIntegrityReport: (report: AuditIntegrityReport | undefined) => void;
  readonly setGlobalAuditEvents: (events: readonly AuditEvent[]) => void;
  readonly setIsLoadingAuditEvents: (isLoading: boolean) => void;
  readonly setIsLoadingGlobalAuditEvents: (isLoading: boolean) => void;
  readonly setIsVerifyingAuditIntegrity: (isVerifying: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAuditLoaders(config: AuditLoaderConfig) {
  return {
    loadAuditEvents: async (
      patientId: string,
      options: AuditLoaderOptions = {}
    ) => {
      if (!config.canReadAudit) {
        config.setAuditEvents([]);
        config.setAuditIntegrityReport(undefined);
        config.setAuditFhirBundlePreview(undefined);

        if (!options.silent) {
          config.setStatusMessage(
            "Nhật ký kiểm toán chỉ mở cho vai trò kiểm toán hoặc quản trị."
          );
        }

        return;
      }

      config.setIsLoadingAuditEvents(true);

      try {
        const data = await listPatientAuditEvents(config.clinicalApi, patientId);
        config.setAuditEvents(data.items);
      } catch (error) {
        config.setAuditEvents([]);
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể tải nhật ký kiểm toán: ${error.message}`
            : "Không thể tải nhật ký kiểm toán."
        );
      } finally {
        config.setIsLoadingAuditEvents(false);
      }
    },
    loadGlobalAuditEvents: async (options: AuditLoaderOptions = {}) => {
      if (!config.canReadAudit) {
        config.setGlobalAuditEvents([]);

        if (!options.silent) {
          config.setStatusMessage(
            "Nhật ký bảo mật toàn hệ thống chỉ mở cho kiểm toán viên hoặc quản trị viên."
          );
        }

        return;
      }

      config.setIsLoadingGlobalAuditEvents(true);

      try {
        const data = await listGlobalAuditEvents(config.clinicalApi);
        config.setGlobalAuditEvents(data.items);

        if (!options.silent) {
          config.setStatusMessage(
            `Đã tải ${data.items.length} bản ghi kiểm toán toàn hệ thống.`
          );
        }
      } catch (error) {
        config.setGlobalAuditEvents([]);
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể tải nhật ký bảo mật toàn hệ thống: ${error.message}`
            : "Không thể tải nhật ký bảo mật toàn hệ thống."
        );
      } finally {
        config.setIsLoadingGlobalAuditEvents(false);
      }
    },
    verifyAuditIntegrity: async (
      patientId: string,
      options: AuditLoaderOptions = {}
    ) => {
      if (!config.canReadAudit) {
        config.setAuditIntegrityReport(undefined);

        if (!options.silent) {
          config.setStatusMessage(
            "Kiểm tra toàn vẹn audit chỉ mở cho vai trò kiểm toán hoặc quản trị."
          );
        }

        return;
      }

      config.setIsVerifyingAuditIntegrity(true);

      try {
        const data = await verifyPatientAuditIntegrity(config.clinicalApi, patientId);
        config.setAuditIntegrityReport(data);

        if (!options.silent) {
          config.setStatusMessage(
            data.verified
              ? "Chuỗi audit đã được xác minh toàn vẹn."
              : `Chuỗi audit cần kiểm tra: ${formatAuditIntegrityReason(data.brokenReason)}.`
          );
        }
      } catch (error) {
        config.setAuditIntegrityReport(undefined);
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể kiểm tra toàn vẹn audit: ${error.message}`
            : "Không thể kiểm tra toàn vẹn audit."
        );
      } finally {
        config.setIsVerifyingAuditIntegrity(false);
      }
    }
  };
}
