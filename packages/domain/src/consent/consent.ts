import { DomainError } from "../shared/domain-error.js";

export type ConsentStatus = "active" | "revoked" | "expired";
export type ConsentCategory = "record-sharing";

export type ConsentSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly status: ConsentStatus;
  readonly category: ConsentCategory;
  readonly granteeOrganizationId: string;
  readonly grantorActorId: string;
  readonly evidenceDocumentId?: string;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateConsentInput = Omit<
  ConsentSnapshot,
  "status" | "createdAt" | "updatedAt"
> & {
  readonly status?: ConsentStatus;
};

export class Consent {
  private constructor(private readonly props: ConsentSnapshot) {}

  static grant(input: CreateConsentInput): Consent {
    const now = new Date();
    const validFrom = parseDate(input.validFrom, "Thời điểm hiệu lực consent không hợp lệ.");
    const validUntil = input.validUntil
      ? parseDate(input.validUntil, "Thời điểm hết hiệu lực consent không hợp lệ.")
      : undefined;

    if (validUntil && validUntil <= validFrom) {
      throw new DomainError("Thời điểm hết hiệu lực consent phải sau thời điểm bắt đầu.");
    }

    return new Consent({
      id: normalizeRequired(input.id, "Mã consent không được để trống."),
      patientId: normalizeRequired(input.patientId, "Consent phải gắn với một bệnh nhân."),
      status: input.status ?? "active",
      category: input.category,
      granteeOrganizationId: normalizeRequired(
        input.granteeOrganizationId,
        "Consent phải có đơn vị nhận dữ liệu."
      ),
      grantorActorId: normalizeRequired(input.grantorActorId, "Consent phải có người/cơ chế ghi nhận."),
      evidenceDocumentId: normalizeOptional(input.evidenceDocumentId),
      validFrom: validFrom.toISOString(),
      validUntil: validUntil?.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ConsentSnapshot): Consent {
    return new Consent({
      ...snapshot,
      evidenceDocumentId: normalizeOptional(snapshot.evidenceDocumentId)
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  allowsRecordSharing(input: {
    readonly patientId: string;
    readonly granteeOrganizationId: string;
    readonly at?: Date;
  }): boolean {
    const now = input.at ?? new Date();
    const validFrom = new Date(this.props.validFrom);
    const validUntil = this.props.validUntil ? new Date(this.props.validUntil) : undefined;

    return (
      this.props.status === "active" &&
      this.props.category === "record-sharing" &&
      this.props.patientId === input.patientId &&
      this.props.granteeOrganizationId === input.granteeOrganizationId &&
      validFrom <= now &&
      (!validUntil || now <= validUntil)
    );
  }

  toSnapshot(): ConsentSnapshot {
    return {
      ...this.props
    };
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
