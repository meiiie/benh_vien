import {
  normalizeCategory,
  normalizeCode,
  normalizeIntent,
  normalizeOptional,
  normalizePriority,
  normalizeRequired,
  normalizeStatus,
  parseDate,
  validateTimeline
} from "./service-request.validation.js";
import type {
  CreateServiceRequestInput,
  ServiceRequestCategory,
  ServiceRequestCode,
  ServiceRequestIntent,
  ServiceRequestPriority,
  ServiceRequestSnapshot,
  ServiceRequestStatus
} from "./service-request.types.js";

export type {
  CreateServiceRequestInput,
  ServiceRequestCategory,
  ServiceRequestCode,
  ServiceRequestIntent,
  ServiceRequestPriority,
  ServiceRequestSnapshot,
  ServiceRequestStatus
} from "./service-request.types.js";

export class ServiceRequest {
  private constructor(private readonly props: ServiceRequestSnapshot) {}

  static order(input: CreateServiceRequestInput): ServiceRequest {
    const now = new Date();
    const authoredOn = input.authoredOn
      ? parseDate(input.authoredOn, "Thời điểm chỉ định dịch vụ không hợp lệ.")
      : now;
    const occurrenceAt = input.occurrenceAt
      ? parseDate(input.occurrenceAt, "Thời điểm dự kiến thực hiện không hợp lệ.")
      : undefined;
    validateTimeline({
      authoredOn,
      occurrenceAt,
      createdAt: now,
      updatedAt: now
    });

    return new ServiceRequest({
      id: normalizeRequired(input.id, "Mã chỉ định dịch vụ không được để trống."),
      patientId: normalizeRequired(input.patientId, "Chỉ định dịch vụ phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      reasonConditionId: normalizeOptional(input.reasonConditionId),
      status: normalizeStatus(input.status ?? "active"),
      intent: normalizeIntent(input.intent ?? "order"),
      category: normalizeCategory(input.category),
      priority: normalizePriority(input.priority ?? "routine"),
      code: normalizeCode(input.code),
      occurrenceAt: occurrenceAt?.toISOString(),
      authoredOn: authoredOn.toISOString(),
      requesterPractitionerId: normalizeRequired(
        input.requesterPractitionerId,
        "Nhân sự chỉ định dịch vụ không được để trống."
      ),
      performerOrganizationId: normalizeOptional(input.performerOrganizationId),
      patientInstruction: normalizeOptional(input.patientInstruction),
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ServiceRequestSnapshot): ServiceRequest {
    const occurrenceAt = snapshot.occurrenceAt
      ? parseDate(snapshot.occurrenceAt, "Thời điểm dự kiến thực hiện không hợp lệ.")
      : undefined;
    const authoredOn = parseDate(
      snapshot.authoredOn,
      "Thời điểm chỉ định dịch vụ không hợp lệ."
    );
    const createdAt = parseDate(
      snapshot.createdAt,
      "Thời điểm tạo chỉ định dịch vụ không hợp lệ."
    );
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật chỉ định dịch vụ không hợp lệ."
    );
    validateTimeline({ authoredOn, occurrenceAt, createdAt, updatedAt });

    return new ServiceRequest({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã chỉ định dịch vụ không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Chỉ định dịch vụ phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      reasonConditionId: normalizeOptional(snapshot.reasonConditionId),
      status: normalizeStatus(snapshot.status),
      intent: normalizeIntent(snapshot.intent),
      category: normalizeCategory(snapshot.category),
      priority: normalizePriority(snapshot.priority),
      code: normalizeCode(snapshot.code),
      occurrenceAt: occurrenceAt?.toISOString(),
      authoredOn: authoredOn.toISOString(),
      requesterPractitionerId: normalizeRequired(
        snapshot.requesterPractitionerId,
        "Nhân sự chỉ định dịch vụ không được để trống."
      ),
      performerOrganizationId: normalizeOptional(snapshot.performerOrganizationId),
      patientInstruction: normalizeOptional(snapshot.patientInstruction),
      note: normalizeOptional(snapshot.note),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): ServiceRequestSnapshot {
    return {
      ...this.props,
      code: { ...this.props.code }
    };
  }
}
