import { DomainError } from "../shared/domain-error.js";
import {
  buildClinicalDocumentProps,
  buildRehydratedClinicalDocumentProps
} from "./clinical-document.factory.js";
import { normalizeDate } from "./clinical-document.validation.js";
import type {
  ClinicalDocumentProps,
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

export class ClinicalDocument {
  private constructor(private readonly props: ClinicalDocumentProps) {}

  static create(input: CreateClinicalDocumentInput): ClinicalDocument {
    return new ClinicalDocument(buildClinicalDocumentProps(input));
  }

  static rehydrate(snapshot: ClinicalDocumentSnapshot): ClinicalDocument {
    return new ClinicalDocument(buildRehydratedClinicalDocumentProps(snapshot));
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
