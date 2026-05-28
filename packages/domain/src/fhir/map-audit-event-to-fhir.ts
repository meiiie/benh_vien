import type {
  AuditAction,
  AuditEvent,
  AuditEventSnapshot,
  AuditResourceType
} from "../audit-event/audit-event.js";
import type { FhirAuditEvent, FhirBundle } from "./fhir-types.js";

type FhirAuditEventEntityDetail = NonNullable<
  NonNullable<FhirAuditEvent["entity"]>[number]["detail"]
>[number];

const auditActionLabels: Record<AuditAction, string> = {
  "auth.login.success": "Đăng nhập thành công",
  "auth.login.failure": "Đăng nhập thất bại",
  "access.denied": "Truy cập bị từ chối",
  "patient.list": "Tải danh sách bệnh nhân",
  "patient.create": "Tạo bệnh nhân",
  "patient.read": "Đọc bệnh nhân",
  "patient.fhir-export": "Xuất Patient FHIR",
  "patient.fhir-bundle-export": "Xuất Bundle hồ sơ bệnh nhân",
  "patient.fhir-document-bundle-export": "Xuất document Bundle hồ sơ bệnh nhân",
  "provider-directory.read": "Đọc Provider Directory",
  "provider-directory.fhir-export": "Xuất Provider Directory FHIR",
  "record-transfer.list": "Tải gói chuyển hồ sơ",
  "record-transfer.create": "Tạo gói chuyển hồ sơ",
  "record-transfer.read": "Đọc gói chuyển hồ sơ",
  "record-transfer.send": "Gửi gói chuyển hồ sơ",
  "record-transfer.fail": "Ghi nhận lỗi chuyển hồ sơ",
  "record-transfer.retry": "Thử gửi lại gói chuyển hồ sơ",
  "record-transfer.receive": "Xác nhận nhận gói chuyển hồ sơ",
  "record-transfer.fhir-export": "Xuất gói chuyển hồ sơ FHIR",
  "encounter.list": "Tải lượt khám",
  "encounter.create": "Tạo lượt khám",
  "encounter.read": "Đọc lượt khám",
  "encounter.finish": "Kết thúc lượt khám",
  "encounter.fhir-export": "Xuất Encounter FHIR",
  "allergy-intolerance.list": "Tải dị ứng/cảnh báo",
  "allergy-intolerance.create": "Ghi nhận dị ứng/cảnh báo",
  "allergy-intolerance.read": "Đọc dị ứng/cảnh báo",
  "allergy-intolerance.fhir-export": "Xuất AllergyIntolerance FHIR",
  "condition.list": "Tải chẩn đoán",
  "condition.create": "Ghi nhận chẩn đoán",
  "condition.read": "Đọc chẩn đoán",
  "condition.fhir-export": "Xuất Condition FHIR",
  "medication-request.list": "Tải chỉ định thuốc",
  "medication-request.create": "Tạo chỉ định thuốc",
  "medication-request.read": "Đọc chỉ định thuốc",
  "medication-request.fhir-export": "Xuất MedicationRequest FHIR",
  "medication-dispense.list": "Tải cấp phát thuốc",
  "medication-dispense.create": "Ghi nhận cấp phát thuốc",
  "medication-dispense.read": "Đọc cấp phát thuốc",
  "medication-dispense.fhir-export": "Xuất MedicationDispense FHIR",
  "medication-administration.list": "Tải dùng thuốc thực tế",
  "medication-administration.create": "Ghi nhận dùng thuốc thực tế",
  "medication-administration.read": "Đọc dùng thuốc thực tế",
  "medication-administration.fhir-export": "Xuất MedicationAdministration FHIR",
  "observation.list": "Tải chỉ số lâm sàng",
  "observation.create": "Ghi nhận chỉ số lâm sàng",
  "observation.read": "Đọc chỉ số lâm sàng",
  "observation.fhir-export": "Xuất Observation FHIR",
  "service-request.list": "Tải chỉ định dịch vụ",
  "service-request.create": "Tạo chỉ định dịch vụ",
  "service-request.read": "Đọc chỉ định dịch vụ",
  "service-request.fhir-export": "Xuất ServiceRequest FHIR",
  "workflow-task.list": "Tải công việc thực thi",
  "workflow-task.create": "Tạo công việc thực thi",
  "workflow-task.read": "Đọc công việc thực thi",
  "workflow-task.fhir-export": "Xuất Task FHIR",
  "procedure.list": "Tải thủ thuật/hoạt động",
  "procedure.create": "Ghi nhận thủ thuật/hoạt động",
  "procedure.read": "Đọc thủ thuật/hoạt động",
  "procedure.fhir-export": "Xuất Procedure FHIR",
  "diagnostic-report.list": "Tải báo cáo kết quả",
  "diagnostic-report.create": "Tạo báo cáo kết quả",
  "diagnostic-report.read": "Đọc báo cáo kết quả",
  "diagnostic-report.fhir-export": "Xuất DiagnosticReport FHIR",
  "imaging-study.list": "Tải nghiên cứu hình ảnh",
  "imaging-study.create": "Tạo nghiên cứu hình ảnh",
  "imaging-study.read": "Đọc nghiên cứu hình ảnh",
  "imaging-study.fhir-export": "Xuất ImagingStudy FHIR",
  "clinical-document.list": "Tải tài liệu bệnh án",
  "clinical-document.create": "Tạo tài liệu bệnh án",
  "clinical-document.sign": "Ký tài liệu bệnh án",
  "clinical-document.fhir-export": "Xuất DocumentReference FHIR",
  "clinical-document.provenance-export": "Xuất Provenance FHIR của tài liệu",
  "consent.list": "Tải đồng ý chia sẻ hồ sơ",
  "consent.create": "Tạo đồng ý chia sẻ hồ sơ",
  "consent.revoke": "Thu hồi đồng ý chia sẻ hồ sơ",
  "consent.fhir-export": "Xuất Consent FHIR",
  "audit-event.list": "Tải nhật ký kiểm toán",
  "audit-event.fhir-export": "Xuất AuditEvent FHIR",
  "audit-event.integrity-verify": "Kiểm tra toàn vẹn audit"
};

const fhirResourceByAuditResource: Record<AuditResourceType, string> = {
  Patient: "Patient",
  ProviderDirectory: "Bundle",
  RecordTransfer: "Task",
  Encounter: "Encounter",
  AllergyIntolerance: "AllergyIntolerance",
  Condition: "Condition",
  MedicationRequest: "MedicationRequest",
  MedicationDispense: "MedicationDispense",
  MedicationAdministration: "MedicationAdministration",
  Observation: "Observation",
  ServiceRequest: "ServiceRequest",
  Task: "Task",
  Procedure: "Procedure",
  DiagnosticReport: "DiagnosticReport",
  ImagingStudy: "ImagingStudy",
  ClinicalDocument: "DocumentReference",
  Consent: "Consent",
  AuditEvent: "AuditEvent"
};

export function mapAuditEventToFhir(event: AuditEvent): FhirAuditEvent {
  const snapshot = event.toSnapshot();
  const details = buildEntityDetails(snapshot);

  return {
    resourceType: "AuditEvent",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/AuditEvent"]
    },
    type: {
      system: "http://terminology.hl7.org/CodeSystem/audit-event-type",
      code: "rest",
      display: "RESTful Operation"
    },
    subtype: [
      {
        system: "urn:wiiicare:nexus:audit-action",
        code: snapshot.action,
        display: auditActionLabels[snapshot.action]
      }
    ],
    action: mapAuditAction(snapshot.action),
    recorded: snapshot.occurredAt,
    outcome: mapAuditOutcome(snapshot.action),
    outcomeDesc: mapAuditOutcomeDescription(snapshot.action),
    agent: [
      {
        who: {
          reference: `Practitioner/${snapshot.actorId}`,
          display: snapshot.actorId
        },
        requestor: true,
        purposeOfUse: snapshot.purposeOfUse
          ? [mapPurposeOfUse(snapshot.purposeOfUse)]
          : undefined,
        network: snapshot.ipAddress
          ? {
              address: snapshot.ipAddress,
              type: "2"
            }
          : undefined
      }
    ],
    source: {
      site: "WiiiCare Nexus",
      observer: {
        display: "WiiiCare Nexus API"
      },
      type: [
        {
          system: "urn:wiiicare:nexus:audit-source-type",
          code: "application-server",
          display: "Application server"
        }
      ]
    },
    entity: [
      {
        what: {
          reference: `${fhirResourceByAuditResource[snapshot.resourceType]}/${snapshot.resourceId}`,
          display: `${snapshot.resourceType}/${snapshot.resourceId}`
        },
        name: snapshot.action,
        description: auditActionLabels[snapshot.action],
        detail: details.length > 0 ? details : undefined
      }
    ]
  };
}

export function mapAuditEventsToFhirBundle(
  patientId: string,
  events: readonly AuditEvent[],
  timestamp = new Date()
): FhirBundle {
  const timestampIso = timestamp.toISOString();

  return {
    resourceType: "Bundle",
    id: `patient-audit-${patientId}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
    },
    identifier: {
      system: "urn:wiiicare:nexus:fhir-audit-bundle",
      value: `audit-events:${patientId}:${timestampIso}`
    },
    type: "collection",
    timestamp: timestampIso,
    entry: events.map((event) => {
      const resource = mapAuditEventToFhir(event);

      return {
        fullUrl: `urn:wiiicare:nexus:AuditEvent:${resource.id ?? resource.recorded}`,
        resource
      };
    })
  };
}

function mapAuditAction(action: AuditAction): FhirAuditEvent["action"] {
  if (action.endsWith(".create")) {
    return "C";
  }

  if (action.endsWith(".sign") || action.endsWith(".finish") || action.endsWith(".revoke")) {
    return "U";
  }

  if (
    action.endsWith(".integrity-verify") ||
    action === "access.denied" ||
    action.startsWith("auth.login.")
  ) {
    return "E";
  }

  return "R";
}

function mapAuditOutcome(action: AuditAction): FhirAuditEvent["outcome"] {
  return action === "access.denied" || action === "auth.login.failure" ? "4" : "0";
}

function mapAuditOutcomeDescription(action: AuditAction): string {
  if (action === "auth.login.failure") {
    return "Authentication failed";
  }

  return action === "access.denied" ? "Access denied" : "Success";
}

function mapPurposeOfUse(purposeOfUse: string) {
  const purposeMap: Record<string, { readonly code: string; readonly display: string }> = {
    TREATMENT: {
      code: "TREAT",
      display: "Treatment"
    },
    AUDIT: {
      code: "AUDIT",
      display: "Audit"
    },
    OPERATIONS: {
      code: "HOPERAT",
      display: "Healthcare operations"
    }
  };
  const mapped = purposeMap[purposeOfUse] ?? {
    code: purposeOfUse,
    display: purposeOfUse
  };

  return {
    system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
    code: mapped.code,
    display: mapped.display
  };
}

function buildEntityDetails(snapshot: AuditEventSnapshot): readonly FhirAuditEventEntityDetail[] {
  const details: FhirAuditEventEntityDetail[] = [];

  if (snapshot.patientId) {
    details.push({
      type: "patientId",
      valueString: snapshot.patientId
    });
  }

  if (snapshot.purposeOfUse) {
    details.push({
      type: "purposeOfUse",
      valueString: snapshot.purposeOfUse
    });
  }

  if (snapshot.hashAlgorithm) {
    details.push({
      type: "hashAlgorithm",
      valueString: snapshot.hashAlgorithm
    });
  }

  if (snapshot.previousHash) {
    details.push({
      type: "previousHash",
      valueString: snapshot.previousHash
    });
  }

  if (snapshot.payloadHash) {
    details.push({
      type: "payloadHash",
      valueString: snapshot.payloadHash
    });
  }

  if (snapshot.integrityHash) {
    details.push({
      type: "integrityHash",
      valueString: snapshot.integrityHash
    });
  }

  details.push({
    type: "metadata",
    valueString: JSON.stringify(snapshot.metadata)
  });

  return details;
}
