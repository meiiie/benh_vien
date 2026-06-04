import { DomainError } from "../shared/domain-error.js";
import {
  assertRevocationWithinPeriod,
  normalizeDate,
  normalizeOptional,
  normalizeRequired
} from "./consent.validation.js";
import {
  buildConsentSnapshot,
  normalizePersistedConsentSnapshot
} from "./consent.factory.js";
import type { ConsentProps } from "./consent.factory.js";
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

export class Consent {
  private constructor(private readonly props: ConsentProps) {}

  static grant(input: CreateConsentInput): Consent {
    return new Consent(buildConsentSnapshot(input));
  }

  static rehydrate(snapshot: ConsentSnapshot): Consent {
    return new Consent(normalizePersistedConsentSnapshot(snapshot));
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
