import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { AppRoute } from "../../types/appRuntime.js";
import type {
  ClinicalDocument,
  NewClinicalDocumentForm
} from "../../types/clinicalDocuments.js";
import type { Patient } from "../../types/patientRegistry.js";
import {
  createClinicalDocument,
  signClinicalDocument
} from "./clinicalDocumentApi.js";
import { buildCreateClinicalDocumentCommandDraft } from "./clinicalDocumentCommandBuilders.js";

type ClinicalDocumentHandlerConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly documentForm: NewClinicalDocumentForm;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly loadAuditEvents: (
    patientId: string,
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadClinicalDocuments: (
    patientId: string,
    nextSelectedDocumentId?: string
  ) => Promise<void>;
  readonly loadDocumentFhirPreview: (documentId: string) => Promise<void>;
  readonly loadDocumentProvenanceFhirPreview: (documentId: string) => Promise<void>;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsSigningDocument: (isSigning: boolean) => void;
  readonly setIsSubmittingDocument: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildClinicalDocumentHandlers(config: ClinicalDocumentHandlerConfig) {
  return {
    handleCreateClinicalDocument: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!config.selectedPatient) {
        config.setStatusMessage(
          "Cần chọn bệnh nhân trước khi tạo tài liệu bệnh án."
        );
        return;
      }

      if (!config.ensureSelectedPatientWritable()) {
        return;
      }

      const commandDraft = buildCreateClinicalDocumentCommandDraft(
        config.documentForm,
        config.selectedPatient.id
      );

      if (!commandDraft.ok) {
        config.setStatusMessage(commandDraft.message);
        return;
      }

      config.setIsSubmittingDocument(true);

      try {
        const createdDocument = await createClinicalDocument(
          config.clinicalApi,
          config.selectedPatient.id,
          commandDraft.command
        );
        await config.loadClinicalDocuments(
          config.selectedPatient.id,
          createdDocument.id
        );
        await config.loadAuditEvents(config.selectedPatient.id, { silent: true });
        config.setAppRoute("documents");
        config.setStatusMessage(
          `Đã tạo tài liệu "${createdDocument.title}" ở trạng thái nháp.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể tạo tài liệu bệnh án: ${error.message}`
            : "Không thể tạo tài liệu bệnh án."
        );
      } finally {
        config.setIsSubmittingDocument(false);
      }
    },
    handleSignClinicalDocument: async (documentId: ClinicalDocument["id"]) => {
      if (!config.ensureSelectedPatientWritable()) {
        return;
      }

      config.setIsSigningDocument(true);

      try {
        const signedDocument = await signClinicalDocument(
          config.clinicalApi,
          documentId
        );
        await config.loadClinicalDocuments(signedDocument.patientId, signedDocument.id);
        await config.loadDocumentFhirPreview(signedDocument.id);
        await config.loadDocumentProvenanceFhirPreview(signedDocument.id);
        await config.loadAuditEvents(signedDocument.patientId, { silent: true });
        config.setStatusMessage(`Đã ký tài liệu "${signedDocument.title}".`);
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ký tài liệu bệnh án: ${error.message}`
            : "Không thể ký tài liệu bệnh án."
        );
      } finally {
        config.setIsSigningDocument(false);
      }
    }
  };
}
