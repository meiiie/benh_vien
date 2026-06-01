import type { FastifyReply } from "fastify";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export type PatientRecordBundleType = "collection" | "document";

export function sendMissingPatientResponse(
  reply: FastifyReply,
  patientId: string,
  bundleType: PatientRecordBundleType
) {
  if (bundleType === "collection") {
    return reply.status(404).send({
      error: "PATIENT_NOT_FOUND"
    });
  }

  return sendFhirOperationOutcome(reply, {
    statusCode: 404,
    code: "not-found",
    diagnostics: `Patient/${patientId} không tồn tại để xuất FHIR document Bundle.`,
    expression: ["Composition.subject.reference"],
    details: {
      code: "PATIENT_NOT_FOUND",
      display: "Patient not found",
      text: "Không tìm thấy hồ sơ bệnh nhân cần đóng gói document Bundle."
    }
  });
}

export function sendMissingTransferContextResponse(
  reply: FastifyReply,
  bundleType: PatientRecordBundleType
) {
  const isDocumentBundle = bundleType === "document";

  return sendFhirOperationOutcome(reply, {
    statusCode: 400,
    code: "required",
    diagnostics: `Thiếu x-consent-reference hoặc x-recipient-organization-id khi xuất FHIR ${
      isDocumentBundle ? "document " : ""
    }Bundle hồ sơ bệnh nhân.`,
    details: {
      code: "MISSING_BUNDLE_TRANSFER_CONTEXT",
      display: "Missing transfer context",
      text: `Cần khai báo consent và đơn vị nhận trước khi xuất ${
        isDocumentBundle ? "document " : ""
      }Bundle phục vụ liên thông.`
    }
  });
}

export function sendInvalidConsentResponse(
  reply: FastifyReply,
  bundleType: PatientRecordBundleType
) {
  const isDocumentBundle = bundleType === "document";

  return sendFhirOperationOutcome(reply, {
    statusCode: 403,
    code: "suppressed",
    diagnostics:
      "Consent không tồn tại, không còn hiệu lực hoặc không khớp bệnh nhân/đơn vị nhận.",
    expression: ["Bundle.meta.security"],
    details: {
      code: "CONSENT_NOT_VALID_FOR_TRANSFER",
      display: "Consent not valid for transfer",
      text: `Không được xuất ${
        isDocumentBundle ? "document " : ""
      }Bundle vì consent chia sẻ hồ sơ không hợp lệ.`
    }
  });
}
