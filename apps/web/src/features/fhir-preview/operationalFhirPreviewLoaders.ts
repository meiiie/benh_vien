import { exportPatientAuditFhirBundle } from "../audit/auditApi.js";
import { exportProviderDirectoryFhir } from "../provider-directory/providerDirectoryApi.js";
import { exportRecordTransferFhirTask } from "../record-transfers/recordTransferApi.js";
import type {
  FhirPreviewLoaderBuilder,
  FhirPreviewLoaderConfig
} from "./fhirPreviewLoaderTypes.js";

type OperationalFhirPreviewLoaderConfig = Pick<
  FhirPreviewLoaderConfig,
  | "canReadAudit"
  | "clinicalApi"
  | "setAuditFhirBundlePreview"
  | "setIsExportingAuditFhir"
  | "setProviderDirectoryFhirPreview"
  | "setRecordTransferFhirTaskPreview"
  | "setStatusMessage"
>;

export function buildOperationalFhirPreviewLoaders(
  config: OperationalFhirPreviewLoaderConfig,
  buildLoader: FhirPreviewLoaderBuilder
) {
  return {
    loadAuditFhirBundle: async (patientId: string) => {
      if (!config.canReadAudit) {
        config.setAuditFhirBundlePreview(undefined);
        config.setStatusMessage(
          "Xuất FHIR AuditEvent chỉ mở cho vai trò kiểm toán hoặc quản trị."
        );
        return;
      }

      config.setIsExportingAuditFhir(true);

      try {
        config.setAuditFhirBundlePreview(
          await exportPatientAuditFhirBundle(config.clinicalApi, patientId)
        );
        config.setStatusMessage(
          "Đã xuất FHIR AuditEvent Bundle cho nhật ký kiểm toán."
        );
      } catch (error) {
        config.setAuditFhirBundlePreview({
          error:
            error instanceof Error
              ? `Không thể xuất FHIR AuditEvent Bundle: ${error.message}`
              : "Không thể xuất FHIR AuditEvent Bundle."
        });
      } finally {
        config.setIsExportingAuditFhir(false);
      }
    },
    loadProviderDirectoryFhirPreview: buildLoader(
      "Không thể xuất FHIR Provider Directory",
      exportProviderDirectoryFhir,
      config.setProviderDirectoryFhirPreview
    ),
    loadRecordTransferFhirTaskPreview: buildLoader(
      "Không thể xuất FHIR Task của gói chuyển",
      exportRecordTransferFhirTask,
      config.setRecordTransferFhirTaskPreview
    )
  };
}
