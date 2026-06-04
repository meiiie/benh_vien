import type {
  AuditEventRepository,
  ProviderDirectoryRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";

export type RecordTransferAcknowledgementRouteDependencies = {
  readonly recordTransferRepository: RecordTransferRepository;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
  readonly auditRepository: AuditEventRepository;
};
