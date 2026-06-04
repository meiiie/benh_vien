import { DomainError } from "@benh-vien-so/domain";
import { maxResponseBodyPreviewLength } from "./record-transfer-delivery-worker.config.js";

export function truncatePreview(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.slice(0, maxResponseBodyPreviewLength);
}

export async function readResponseBodyPreview(
  response: Response
): Promise<string | undefined> {
  try {
    return truncatePreview(await response.text());
  } catch {
    return undefined;
  }
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể gửi FHIR Bundle sang endpoint đích.";
}
