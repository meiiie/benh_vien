import { DomainError } from "../shared/domain-error.js";

export type EncounterClass = "ambulatory" | "inpatient" | "emergency" | "virtual";

export type EncounterStatus =
  | "planned"
  | "in-progress"
  | "finished"
  | "cancelled"
  | "entered-in-error";

const encounterClasses = new Set<EncounterClass>([
  "ambulatory",
  "inpatient",
  "emergency",
  "virtual"
]);
const encounterStatuses = new Set<EncounterStatus>([
  "planned",
  "in-progress",
  "finished",
  "cancelled",
  "entered-in-error"
]);

export type EncounterSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly status: EncounterStatus;
  readonly class: EncounterClass;
  readonly serviceType: string;
  readonly reasonText: string;
  readonly departmentId?: string;
  readonly attendingPractitionerId: string;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateEncounterInput = Omit<
  EncounterSnapshot,
  "status" | "endedAt" | "createdAt" | "updatedAt"
> & {
  readonly status?: EncounterStatus;
  readonly endedAt?: string;
};

type EncounterProps = {
  id: string;
  patientId: string;
  status: EncounterStatus;
  class: EncounterClass;
  serviceType: string;
  reasonText: string;
  departmentId?: string;
  attendingPractitionerId: string;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class Encounter {
  private constructor(private readonly props: EncounterProps) {}

  static create(input: CreateEncounterInput): Encounter {
    const now = new Date();
    const startedAt = parseDate(input.startedAt, "Thời điểm bắt đầu lượt khám không hợp lệ.");
    const endedAt = input.endedAt
      ? parseDate(input.endedAt, "Thời điểm kết thúc lượt khám không hợp lệ.")
      : undefined;

    if (endedAt && endedAt < startedAt) {
      throw new DomainError("Thời điểm kết thúc không được trước thời điểm bắt đầu.");
    }

    const status = normalizeStatus(input.status ?? (endedAt ? "finished" : "in-progress"));
    const encounterClass = normalizeClass(input.class);
    validateLifecycle(status, startedAt, endedAt);

    return new Encounter({
      id: normalizeRequired(input.id, "Mã lượt khám không được để trống."),
      patientId: normalizeRequired(input.patientId, "Lượt khám phải gắn với một bệnh nhân."),
      status,
      class: encounterClass,
      serviceType: normalizeRequired(input.serviceType, "Dịch vụ/khoa khám không được để trống."),
      reasonText: normalizeRequired(input.reasonText, "Lý do khám không được để trống."),
      departmentId: normalizeOptional(input.departmentId),
      attendingPractitionerId: normalizeRequired(
        input.attendingPractitionerId,
        "Bác sĩ hoặc nhân sự phụ trách không được để trống."
      ),
      startedAt,
      endedAt,
      createdAt: now,
      updatedAt: now
    });
  }

  static rehydrate(snapshot: EncounterSnapshot): Encounter {
    const startedAt = parseDate(
      snapshot.startedAt,
      "Thời điểm bắt đầu lượt khám không hợp lệ."
    );
    const endedAt = snapshot.endedAt
      ? parseDate(snapshot.endedAt, "Thời điểm kết thúc lượt khám không hợp lệ.")
      : undefined;
    const status = normalizeStatus(snapshot.status);

    validateLifecycle(status, startedAt, endedAt);

    return new Encounter({
      id: normalizeRequired(snapshot.id, "Mã lượt khám không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Lượt khám phải gắn với một bệnh nhân."),
      status,
      class: normalizeClass(snapshot.class),
      serviceType: normalizeRequired(snapshot.serviceType, "Dịch vụ/khoa khám không được để trống."),
      reasonText: normalizeRequired(snapshot.reasonText, "Lý do khám không được để trống."),
      departmentId: normalizeOptional(snapshot.departmentId),
      attendingPractitionerId: normalizeRequired(
        snapshot.attendingPractitionerId,
        "Bác sĩ hoặc nhân sự phụ trách không được để trống."
      ),
      startedAt,
      endedAt,
      createdAt: parseDate(snapshot.createdAt, "Thời điểm tạo lượt khám không hợp lệ."),
      updatedAt: parseDate(snapshot.updatedAt, "Thời điểm cập nhật lượt khám không hợp lệ.")
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get status(): EncounterStatus {
    return this.props.status;
  }

  finish(endedAt = new Date()): void {
    if (this.props.status !== "in-progress" && this.props.status !== "planned") {
      throw new DomainError("Chỉ lượt khám đang mở hoặc đã hẹn mới được kết thúc.");
    }

    if (Number.isNaN(endedAt.getTime())) {
      throw new DomainError("Thời điểm kết thúc lượt khám không hợp lệ.");
    }

    if (endedAt < this.props.startedAt) {
      throw new DomainError("Thời điểm kết thúc không được trước thời điểm bắt đầu.");
    }

    this.props.status = "finished";
    this.props.endedAt = endedAt;
    this.touch();
  }

  toSnapshot(): EncounterSnapshot {
    return {
      id: this.props.id,
      patientId: this.props.patientId,
      status: this.props.status,
      class: this.props.class,
      serviceType: this.props.serviceType,
      reasonText: this.props.reasonText,
      departmentId: this.props.departmentId,
      attendingPractitionerId: this.props.attendingPractitionerId,
      startedAt: this.props.startedAt.toISOString(),
      endedAt: this.props.endedAt?.toISOString(),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}

function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}

function normalizeStatus(value: EncounterStatus): EncounterStatus {
  if (!encounterStatuses.has(value)) {
    throw new DomainError("Trạng thái lượt khám không hợp lệ.");
  }

  return value;
}

function normalizeClass(value: EncounterClass): EncounterClass {
  if (!encounterClasses.has(value)) {
    throw new DomainError("Phân loại lượt khám không hợp lệ.");
  }

  return value;
}

function validateLifecycle(
  status: EncounterStatus,
  startedAt: Date,
  endedAt: Date | undefined
): void {
  if (endedAt && endedAt < startedAt) {
    throw new DomainError("Thời điểm kết thúc không được trước thời điểm bắt đầu.");
  }

  if (status === "finished" && !endedAt) {
    throw new DomainError("Lượt khám đã hoàn tất phải có thời điểm kết thúc.");
  }

  if ((status === "planned" || status === "in-progress") && endedAt) {
    throw new DomainError("Lượt khám chưa hoàn tất không được có thời điểm kết thúc.");
  }
}
