import { DomainError } from "../shared/domain-error.js";
import {
  assertPersistenceTimeline,
  assertRevocationWithinPeriod,
  assertValidCategory,
  assertValidPeriod,
  assertValidStatus,
  normalizeDate,
  normalizeOptional,
  normalizeRequired,
  parseDate
} from "./consent.validation.js";
import type {
  ConsentCategory,
  ConsentSnapshot,
  ConsentStatus,
  CreateConsentInput,
  RevokeConsentInput
} from "./consent.types.js";

export type {
  ConsentCategory,
  ConsentSnapshot,
  ConsentStatus,
  CreateConsentInput,
  RevokeConsentInput
} from "./consent.types.js";

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

    assertValidPeriod(validFrom, validUntil);
    assertValidCategory(input.category);

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
    const validFrom = parseDate(snapshot.validFrom, "Thời điểm hiệu lực consent không hợp lệ.");
    const validUntil = snapshot.validUntil
      ? parseDate(snapshot.validUntil, "Thời điểm hết hiệu lực consent không hợp lệ.")
      : undefined;
    const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo consent không hợp lệ.");
    const updatedAt = parseDate(snapshot.updatedAt, "Thời điểm cập nhật consent không hợp lệ.");
    const revokedByActorId = normalizeOptional(snapshot.revokedByActorId);
    const revokedAt = snapshot.revokedAt
      ? parseDate(snapshot.revokedAt, "Thời điểm thu hồi consent không hợp lệ.")
      : undefined;
    const revocationReason = normalizeOptional(snapshot.revocationReason);

    assertValidPeriod(validFrom, validUntil);
    assertValidStatus(snapshot.status);
    assertValidCategory(snapshot.category);
    assertPersistenceTimeline(createdAt, updatedAt);

    if (snapshot.status === "revoked" && (!revokedByActorId || !revokedAt)) {
      throw new DomainError("Consent đã thu hồi phải có người thu hồi và thời điểm thu hồi.");
    }

    if (snapshot.status !== "revoked" && (revokedByActorId || revokedAt || revocationReason)) {
      throw new DomainError("Consent chưa thu hồi không được có metadata thu hồi.");
    }

    if (revokedAt) {
      assertRevocationWithinPeriod(validFrom, validUntil, revokedAt);
    }

    return new Consent({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã consent không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Consent phải gắn với một bệnh nhân."),
      granteeOrganizationId: normalizeRequired(
        snapshot.granteeOrganizationId,
        "Consent phải có đơn vị nhận dữ liệu."
      ),
      grantorActorId: normalizeRequired(
        snapshot.grantorActorId,
        "Consent phải có người/cơ chế ghi nhận."
      ),
      evidenceDocumentId: normalizeOptional(snapshot.evidenceDocumentId),
      revokedByActorId,
      revokedAt: revokedAt?.toISOString(),
      revocationReason,
      validFrom: validFrom.toISOString(),
      validUntil: validUntil?.toISOString(),
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

  get status(): ConsentStatus {
    return this.props.status;
  }

  revoke(input: RevokeConsentInput): void {
    if (this.props.status !== "active") {
      throw new DomainError("Chỉ consent đang hiệu lực mới được thu hồi.");
    }

    const revokedAt = normalizeDate(
      input.revokedAt ?? new Date(),
      "Thời điểm thu hồi consent không hợp lệ."
    );
    assertRevocationWithinPeriod(
      new Date(this.props.validFrom),
      this.props.validUntil ? new Date(this.props.validUntil) : undefined,
      revokedAt
    );

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
