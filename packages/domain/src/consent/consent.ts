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
  readonly revokedByActorId?: string;
  readonly revokedAt?: string;
  readonly revocationReason?: string;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateConsentInput = Omit<
  ConsentSnapshot,
  "status" | "revokedByActorId" | "revokedAt" | "revocationReason" | "createdAt" | "updatedAt"
>;

export type RevokeConsentInput = {
  readonly revokedByActorId: string;
  readonly revokedAt?: Date;
  readonly reason?: string;
};

type ConsentProps = {
  -readonly [Key in keyof ConsentSnapshot]: ConsentSnapshot[Key];
};

export class Consent {
  private constructor(private readonly props: ConsentProps) {}

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
      status: "active",
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
    const revokedByActorId = normalizeOptional(snapshot.revokedByActorId);
    const revokedAt = snapshot.revokedAt
      ? parseDate(snapshot.revokedAt, "Thời điểm thu hồi consent không hợp lệ.").toISOString()
      : undefined;
    const revocationReason = normalizeOptional(snapshot.revocationReason);

    if (snapshot.status === "revoked" && (!revokedByActorId || !revokedAt)) {
      throw new DomainError("Consent đã thu hồi phải có người thu hồi và thời điểm thu hồi.");
    }

    if (snapshot.status !== "revoked" && (revokedByActorId || revokedAt || revocationReason)) {
      throw new DomainError("Consent chưa thu hồi không được có metadata thu hồi.");
    }

    return new Consent({
      ...snapshot,
      evidenceDocumentId: normalizeOptional(snapshot.evidenceDocumentId),
      revokedByActorId,
      revokedAt,
      revocationReason
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get status(): ConsentStatus {
    return this.props.status;
  }

  revoke(input: RevokeConsentInput): void {
    if (this.props.status !== "active") {
      throw new DomainError("Chỉ consent đang hiệu lực mới được thu hồi.");
    }

    const revokedAt = input.revokedAt ?? new Date();

    this.props.status = "revoked";
    this.props.revokedByActorId = normalizeRequired(
      input.revokedByActorId,
      "Consent thu hồi phải có người hoặc cơ chế thực hiện."
    );
    this.props.revokedAt = revokedAt.toISOString();
    this.props.revocationReason = normalizeOptional(input.reason);
    this.props.updatedAt = revokedAt.toISOString();
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
