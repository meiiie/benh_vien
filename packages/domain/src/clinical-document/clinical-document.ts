import { DomainError } from "../shared/domain-error.js";
import {
  normalizeAttachmentContentType,
  normalizeAttachmentHash,
  normalizeAttachmentSize,
  normalizeDate,
  normalizeStatus,
  parseOptionalDate,
  parseRequiredDate,
  validateTimeline
} from "./clinical-document.validation.js";
import type {
  ClinicalDocumentSnapshot,
  ClinicalDocumentStatus,
  ClinicalDocumentType,
  CreateClinicalDocumentInput
} from "./clinical-document.types.js";

export type {
  ClinicalDocumentSnapshot,
  ClinicalDocumentStatus,
  ClinicalDocumentType,
  CreateClinicalDocumentInput
} from "./clinical-document.types.js";

type ClinicalDocumentProps = {
  id: string;
  patientId: string;
  encounterId?: string;
  type: ClinicalDocumentType;
  title: string;
  status: ClinicalDocumentStatus;
  storageUri: string;
  attachmentContentType?: string;
  attachmentSizeBytes?: number;
  attachmentHashSha1Base64?: string;
  attachmentCreatedAt?: Date;
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

    const attachmentContentType = normalizeAttachmentContentType(
      input.attachmentContentType
    );
    const attachmentHashSha1Base64 = normalizeAttachmentHash(
      input.attachmentHashSha1Base64
    );

    return new ClinicalDocument({
      ...input,
      id: input.id.trim(),
      patientId: input.patientId.trim(),
      encounterId: input.encounterId?.trim() || undefined,
      title: input.title.trim(),
      storageUri: input.storageUri.trim(),
      attachmentContentType,
      attachmentSizeBytes: normalizeAttachmentSize(input.attachmentSizeBytes),
      attachmentHashSha1Base64,
      attachmentCreatedAt: parseOptionalDate(
        input.attachmentCreatedAt,
        "Thời điểm tạo tệp đính kèm không hợp lệ."
      ),
      authorPractitionerId: input.authorPractitionerId.trim(),
      status: "draft",
      createdAt: now,
      updatedAt: now
    });
  }

  static rehydrate(snapshot: ClinicalDocumentSnapshot): ClinicalDocument {
    const signedAt = parseOptionalDate(
      snapshot.signedAt,
      "Thời điểm ký tài liệu không hợp lệ."
    );
    const createdAt = parseRequiredDate(
      snapshot.createdAt,
      "Thời điểm tạo tài liệu không hợp lệ."
    );
    const updatedAt = parseRequiredDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật tài liệu không hợp lệ."
    );

    validateTimeline({ createdAt, updatedAt, signedAt });

    return new ClinicalDocument({
      id: snapshot.id,
      patientId: snapshot.patientId,
      encounterId: snapshot.encounterId,
      type: snapshot.type,
      title: snapshot.title,
      status: normalizeStatus(snapshot.status, signedAt),
      storageUri: snapshot.storageUri,
      attachmentContentType: normalizeAttachmentContentType(
        snapshot.attachmentContentType
      ),
      attachmentSizeBytes: normalizeAttachmentSize(snapshot.attachmentSizeBytes),
      attachmentHashSha1Base64: normalizeAttachmentHash(
        snapshot.attachmentHashSha1Base64
      ),
      attachmentCreatedAt: parseOptionalDate(
        snapshot.attachmentCreatedAt,
        "Thời điểm tạo tệp đính kèm không hợp lệ."
      ),
      authorPractitionerId: snapshot.authorPractitionerId,
      signedAt,
      createdAt,
      updatedAt
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

    const normalizedSignedAt = normalizeDate(
      signedAt,
      "Thời điểm ký tài liệu không hợp lệ."
    );

    if (normalizedSignedAt < this.props.createdAt) {
      throw new DomainError("Thời điểm ký tài liệu không được trước thời điểm tạo tài liệu.");
    }

    this.props.status = "signed";
    this.props.signedAt = normalizedSignedAt;
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
      attachmentContentType: this.props.attachmentContentType,
      attachmentSizeBytes: this.props.attachmentSizeBytes,
      attachmentHashSha1Base64: this.props.attachmentHashSha1Base64,
      attachmentCreatedAt: this.props.attachmentCreatedAt?.toISOString(),
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
