import type {
  GatewayAcknowledgementForm,
  NewRecordTransferForm
} from "../types/recordTransfers.js";

export const defaultTransferContext = {
  consentReference: "consent-demo-transfer-001",
  recipientOrganizationId: "hospital-hai-phong-referral"
};

export const defaultRecordTransferForm: NewRecordTransferForm = {
  priority: "urgent",
  bundleType: "document",
  sourceOrganizationId: "hospital-hai-phong-demo",
  recipientOrganizationId: defaultTransferContext.recipientOrganizationId,
  consentReference: defaultTransferContext.consentReference,
  reason:
    "Chuyển hồ sơ sang bệnh viện tiếp nhận để theo dõi sau cấp cứu.",
  note: "Dùng FHIR document Bundle có Composition làm mục lục lâm sàng."
};

export const defaultGatewayAcknowledgementForm: GatewayAcknowledgementForm = {
  recordTransferId: "record-transfer-demo-001",
  recipientOrganizationId: defaultTransferContext.recipientOrganizationId,
  acknowledgementReference: "ack-record-transfer-callback-demo-001",
  receivedAt: "",
  receivedByActorId: "system-hai-phong-referral-gateway",
  targetEndpointId: "endpoint-fhir-hai-phong-referral",
  deliveryIdempotencyKey: "wiiicare-record-transfer-callback-demo-001",
  note:
    "Bệnh viện nhận xác nhận đã tiếp nhận gói hồ sơ qua gateway liên thông."
};
