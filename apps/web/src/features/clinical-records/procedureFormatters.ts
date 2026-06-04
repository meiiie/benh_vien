import { labelOf } from "./careWorkflowFormatterPrimitives.js";

type ProcedurePerformerLike = {
  readonly actorType: string;
  readonly actorId: string;
  readonly function?: {
    readonly display: string;
  };
  readonly onBehalfOfOrganizationId?: string;
};

type ProcedureReportReferenceLike = {
  readonly id: string;
  readonly resourceType: string;
};

export function formatProcedureStatus(status: string): string {
  return labelOf(
    {
      completed: "Hoàn tất",
      "entered-in-error": "Nhập lỗi",
      "in-progress": "Đang thực hiện",
      "not-done": "Không thực hiện",
      "on-hold": "Tạm giữ",
      preparation: "Chuẩn bị",
      stopped: "Đã dừng",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatProcedureCategory(category: string): string {
  return labelOf(
    {
      counseling: "Tư vấn",
      diagnostic: "Chẩn đoán",
      other: "Khác",
      rehabilitation: "Phục hồi chức năng",
      surgical: "Phẫu thuật",
      therapeutic: "Điều trị"
    },
    category
  );
}

export function formatProcedurePerformers(
  performers: readonly ProcedurePerformerLike[]
): string {
  if (performers.length === 0) {
    return "Chưa có";
  }

  return performers
    .map((performer) =>
      [
        `${performer.actorType}/${performer.actorId}`,
        performer.function?.display,
        performer.onBehalfOfOrganizationId
          ? `thay mặt ${performer.onBehalfOfOrganizationId}`
          : undefined
      ]
        .filter(Boolean)
        .join(" · ")
    )
    .join(", ");
}

export function formatProcedureReferences(
  references: readonly ProcedureReportReferenceLike[]
): string {
  if (references.length === 0) {
    return "Chưa có";
  }

  return references
    .map((reference) => `${reference.resourceType}/${reference.id}`)
    .join(", ");
}
