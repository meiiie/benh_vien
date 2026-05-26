import { DomainError } from "../shared/domain-error.js";

export type EncounterClass = "ambulatory" | "inpatient" | "emergency" | "virtual";

export type EncounterStatus =
  | "planned"
  | "in-progress"
  | "finished"
  | "cancelled"
  | "entered-in-error";

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

    const status = input.status ?? (endedAt ? "finished" : "in-progress");

    return new Encounter({
      id: normalizeRequired(input.id, "Mã lượt khám không được để trống."),
      patientId: normalizeRequired(input.patientId, "Lượt khám phải gắn với một bệnh nhân."),
      status,
      class: input.class,
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
    return new Encounter({
      id: snapshot.id,
      patientId: snapshot.patientId,
      status: snapshot.status,
      class: snapshot.class,
      serviceType: snapshot.serviceType,
      reasonText: snapshot.reasonText,
      departmentId: snapshot.departmentId,
      attendingPractitionerId: snapshot.attendingPractitionerId,
      startedAt: new Date(snapshot.startedAt),
      endedAt: snapshot.endedAt ? new Date(snapshot.endedAt) : undefined,
      createdAt: new Date(snapshot.createdAt),
      updatedAt: new Date(snapshot.updatedAt)
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
