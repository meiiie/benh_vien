import { DomainError } from "../shared/domain-error.js";

export type ClinicalDocumentType =
  | "admission-note"
  | "discharge-summary"
  | "lab-report"
  | "imaging-report"
  | "referral-letter"
  | "consent-form";

export type ClinicalDocumentStatus = "draft" | "signed" | "superseded" | "entered-in-error";

export type ClinicalDocumentSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly type: ClinicalDocumentType;
  readonly title: string;
  readonly status: ClinicalDocumentStatus;
  readonly storageUri: string;
  readonly authorPractitionerId: string;
  readonly signedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateClinicalDocumentInput = Omit<
  ClinicalDocumentSnapshot,
  "status" | "signedAt" | "createdAt" | "updatedAt"
>;

type ClinicalDocumentProps = {
  id: string;
  patientId: string;
  encounterId?: string;
  type: ClinicalDocumentType;
  title: string;
  status: ClinicalDocumentStatus;
  storageUri: string;
  authorPractitionerId: string;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class ClinicalDocument {
  private constructor(private readonly props: ClinicalDocumentProps) {}

  static create(input: CreateClinicalDocumentInput): ClinicalDocument {
    const now = new Date();

    if (!input.patientId.trim()) {
      throw new DomainError("Tài liệu lâm sàng phải gắn với một bệnh nhân.");
    }

    if (!input.storageUri.trim()) {
      throw new DomainError("Tài liệu lâm sàng phải có vị trí lưu trữ.");
    }

    return new ClinicalDocument({
      ...input,
      id: input.id.trim(),
      patientId: input.patientId.trim(),
      encounterId: input.encounterId?.trim() || undefined,
      title: input.title.trim(),
      storageUri: input.storageUri.trim(),
      authorPractitionerId: input.authorPractitionerId.trim(),
      status: "draft",
      createdAt: now,
      updatedAt: now
    });
  }

  static rehydrate(snapshot: ClinicalDocumentSnapshot): ClinicalDocument {
    return new ClinicalDocument({
      id: snapshot.id,
      patientId: snapshot.patientId,
      encounterId: snapshot.encounterId,
      type: snapshot.type,
      title: snapshot.title,
      status: snapshot.status,
      storageUri: snapshot.storageUri,
      authorPractitionerId: snapshot.authorPractitionerId,
      signedAt: snapshot.signedAt ? new Date(snapshot.signedAt) : undefined,
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

  get status(): ClinicalDocumentStatus {
    return this.props.status;
  }

  sign(signedAt = new Date()): void {
    if (this.props.status !== "draft") {
      throw new DomainError("Chỉ tài liệu ở trạng thái nháp mới được ký.");
    }

    this.props.status = "signed";
    this.props.signedAt = signedAt;
    this.touch();
  }

  toSnapshot(): ClinicalDocumentSnapshot {
    return {
      id: this.props.id,
      patientId: this.props.patientId,
      encounterId: this.props.encounterId,
      type: this.props.type,
      title: this.props.title,
      status: this.props.status,
      storageUri: this.props.storageUri,
      authorPractitionerId: this.props.authorPractitionerId,
      signedAt: this.props.signedAt?.toISOString(),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
