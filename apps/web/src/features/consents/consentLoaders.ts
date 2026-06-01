import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { Consent } from "../../types/consents.js";
import type { Patient } from "../../types/patientRegistry.js";
import { listPatientConsents, revokePatientConsent } from "./consentApi.js";
import { buildRevokeConsentCommand } from "./consentCommandBuilders.js";

type ConsentLoaderConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly loadConsentFhirPreview: (consentId: string) => Promise<void>;
  readonly selectedPatient: Patient | undefined;
  readonly setConsents: (consents: readonly Consent[]) => void;
  readonly setIsLoadingConsents: (isLoading: boolean) => void;
  readonly setRevokingConsentId: (consentId: string | undefined) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildConsentLoaders(config: ConsentLoaderConfig) {
  const loadConsents = async (patientId: string) => {
    config.setIsLoadingConsents(true);

    try {
      const data = await listPatientConsents(config.clinicalApi, patientId);
      config.setConsents(data.items);
    } catch (error) {
      config.setConsents([]);
      config.setStatusMessage(
        error instanceof Error
          ? `Không thể tải đồng ý chia sẻ hồ sơ: ${error.message}`
          : "Không thể tải đồng ý chia sẻ hồ sơ."
      );
    } finally {
      config.setIsLoadingConsents(false);
    }
  };

  return {
    loadConsents,
    handleRevokeConsent: async (consent: Consent) => {
      if (!config.selectedPatient) {
        return;
      }

      if (!config.ensureSelectedPatientWritable()) {
        return;
      }

      config.setRevokingConsentId(consent.id);

      try {
        const revokedConsent = await revokePatientConsent(
          config.clinicalApi,
          config.selectedPatient.id,
          consent.id,
          buildRevokeConsentCommand()
        );
        await loadConsents(config.selectedPatient.id);
        await config.loadConsentFhirPreview(revokedConsent.id);
        config.setStatusMessage(
          `Đã thu hồi consent ${revokedConsent.id}; các lần xuất/chuyển hồ sơ mới sẽ bị chặn nếu dùng consent này.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể thu hồi consent: ${error.message}`
            : "Không thể thu hồi consent."
        );
      } finally {
        config.setRevokingConsentId(undefined);
      }
    }
  };
}
