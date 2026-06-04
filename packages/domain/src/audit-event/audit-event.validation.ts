import { createHash } from "node:crypto";
import { DomainError } from "../shared/domain-error.js";
import { auditActions, auditResourceTypes } from "./audit-event.types.js";
import type { AuditAction, AuditEventSnapshot, AuditResourceType } from "./audit-event.types.js";

const sha256HexPattern = /^[a-f0-9]{64}$/;

export function hashAuditPayload(snapshot: AuditEventSnapshot): string {
  return hashCanonical({
    id: snapshot.id ?? null,
    occurredAt: snapshot.occurredAt,
    actorId: snapshot.actorId,
    action: snapshot.action,
    resourceType: snapshot.resourceType,
    resourceId: snapshot.resourceId,
    patientId: snapshot.patientId ?? null,
    purposeOfUse: snapshot.purposeOfUse ?? null,
    ipAddress: snapshot.ipAddress ?? null,
    userAgent: snapshot.userAgent ?? null,
    metadata: snapshot.metadata
  });
}

export function hashCanonical(value: unknown): string {
  return createHash("sha256").update(canonicalize(value)).digest("hex");
}

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)
    .join(",")}}`;
}

export function normalizeAction(value: AuditAction): AuditAction {
  if (!auditActions.has(value)) {
    throw new DomainError("Hành động audit không hợp lệ.");
  }

  return value;
}

export function normalizeResourceType(value: AuditResourceType): AuditResourceType {
  if (!auditResourceTypes.has(value)) {
    throw new DomainError("Loại tài nguyên audit không hợp lệ.");
  }

  return value;
}

export function normalizeMetadata(value: Record<string, unknown>): Record<string, unknown> {
  if (!isPlainRecord(value)) {
    throw new DomainError("Metadata audit phải là object hợp lệ.");
  }

  return { ...value };
}

export function normalizeSealMetadata(snapshot: AuditEventSnapshot): {
  readonly hashAlgorithm?: "sha256";
  readonly previousHash?: string;
  readonly payloadHash?: string;
  readonly integrityHash?: string;
} {
  const previousHash = normalizeOptional(snapshot.previousHash);
  const payloadHash = normalizeOptional(snapshot.payloadHash);
  const integrityHash = normalizeOptional(snapshot.integrityHash);
  const hasSealMetadata =
    snapshot.hashAlgorithm !== undefined ||
    previousHash !== undefined ||
    payloadHash !== undefined ||
    integrityHash !== undefined;

  if (!hasSealMetadata) {
    return {};
  }

  if (snapshot.hashAlgorithm !== "sha256") {
    throw new DomainError("Thuật toán niêm phong audit không hợp lệ.");
  }

  if (!payloadHash || !integrityHash) {
    throw new DomainError("Audit đã niêm phong cần có payloadHash và integrityHash.");
  }

  return {
    hashAlgorithm: "sha256",
    previousHash: previousHash
      ? normalizeHash(previousHash, "previousHash của audit không hợp lệ.")
      : undefined,
    payloadHash: normalizeHash(payloadHash, "payloadHash của audit không hợp lệ."),
    integrityHash: normalizeHash(integrityHash, "integrityHash của audit không hợp lệ.")
  };
}

export function normalizeHash(value: string, message: string): string {
  const normalized = normalizeRequired(value, message);

  if (!sha256HexPattern.test(normalized)) {
    throw new DomainError(message);
  }

  return normalized;
}

export function parseDate(value: string, message: string): Date {
  const date = new Date(normalizeRequired(value, message));
  assertValidDate(date, message);

  return date;
}

export function assertValidDate(value: Date, message: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new DomainError(message);
  }
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

export function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}
