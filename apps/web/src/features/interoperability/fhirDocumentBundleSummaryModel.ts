export type BundleCheck = {
  readonly label: string;
  readonly note: string;
  readonly passed: boolean;
};

export type BundleSummary = {
  readonly compositionFirst: boolean;
  readonly compositionTitle?: string;
  readonly consentCount: number;
  readonly documentReferenceCount: number;
  readonly entryCount: number;
  readonly issueMessage?: string;
  readonly provenanceCount: number;
  readonly taskCount: number;
};

export function buildBundleChecks(summary: BundleSummary): readonly BundleCheck[] {
  return [
    check("Composition đứng ở entry đầu tiên", summary.compositionFirst, "FHIR document Bundle cần Composition làm mục lục lâm sàng."),
    check("Có consent đi kèm", summary.consentCount > 0, "Bên nhận cần thấy căn cứ đồng ý chia sẻ hồ sơ."),
    check("Có tài liệu lâm sàng", summary.documentReferenceCount > 0, "DocumentReference mô tả file, hash, thời điểm tạo và ngữ cảnh."),
    check("Có Provenance cho tài liệu đã ký", summary.provenanceCount > 0, "Provenance cho biết ai ký/xác nhận và nguồn tài liệu nào được dùng.")
  ];
}

export function summarizeDocumentBundle(value: unknown): BundleSummary {
  const bundle = asRecord(value);
  const entries = Array.isArray(bundle?.entry) ? bundle.entry : [];
  const resourceTypes = entries
    .map((entry) => getString(getEntryResource(entry)?.resourceType))
    .filter((resourceType): resourceType is string => Boolean(resourceType));
  const firstResource = getEntryResource(entries[0]);

  return {
    compositionFirst: getString(firstResource?.resourceType) === "Composition",
    compositionTitle: getString(firstResource?.title),
    consentCount: countResource(resourceTypes, "Consent"),
    documentReferenceCount: countResource(resourceTypes, "DocumentReference"),
    entryCount: entries.length,
    issueMessage: extractBundleIssue(bundle),
    provenanceCount: countResource(resourceTypes, "Provenance"),
    taskCount: countResource(resourceTypes, "Task")
  };
}

function check(label: string, passed: boolean, note: string): BundleCheck {
  return { label, note, passed };
}

function countResource(resourceTypes: readonly string[], resourceType: string): number {
  return resourceTypes.filter((item) => item === resourceType).length;
}

function getEntryResource(entry: unknown): Record<string, unknown> | undefined {
  return asRecord(asRecord(entry)?.resource);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function extractBundleIssue(
  bundle: Record<string, unknown> | undefined
): string | undefined {
  const directError = getString(bundle?.error);

  if (directError) {
    return directError;
  }

  if (bundle?.resourceType !== "OperationOutcome") {
    return undefined;
  }

  const firstIssue = Array.isArray(bundle.issue) ? asRecord(bundle.issue[0]) : undefined;
  const details = asRecord(firstIssue?.details);

  return (
    getString(details?.text) ??
    getString(firstIssue?.diagnostics) ??
    "FHIR OperationOutcome báo lỗi khi xuất document Bundle."
  );
}
