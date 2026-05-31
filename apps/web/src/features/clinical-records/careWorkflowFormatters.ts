type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

type WorkflowTaskReferenceLike = {
  readonly id: string;
  readonly resourceType: string;
  readonly label?: string;
};

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

export function formatServiceRequestCategory(category: string): string {
  return labelOf(
    {
      consultation: "Hội chẩn/tư vấn",
      imaging: "Chẩn đoán hình ảnh",
      laboratory: "Xét nghiệm",
      procedure: "Thủ thuật",
      therapy: "Điều trị/phục hồi"
    },
    category
  );
}

export function formatServiceRequestStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hiệu lực",
      completed: "Đã hoàn tất",
      draft: "Bản nháp",
      "entered-in-error": "Nhập lỗi",
      "on-hold": "Tạm giữ",
      revoked: "Đã hủy",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatServiceRequestIntent(intent: string): string {
  return labelOf(
    {
      directive: "Chỉ thị",
      "filler-order": "Lệnh thực hiện",
      "instance-order": "Lệnh dùng cụ thể",
      option: "Tùy chọn",
      order: "Chỉ định",
      "original-order": "Chỉ định gốc",
      plan: "Kế hoạch",
      proposal: "Đề xuất",
      "reflex-order": "Chỉ định phản xạ"
    },
    intent
  );
}

export function formatServiceRequestPriority(priority: string): string {
  return labelOf(
    {
      asap: "Càng sớm càng tốt",
      routine: "Thường quy",
      stat: "Ngay lập tức",
      urgent: "Khẩn"
    },
    priority
  );
}

export function formatWorkflowTaskStatus(status: string): string {
  return labelOf(
    {
      accepted: "Đã nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn tất",
      draft: "Bản nháp",
      "entered-in-error": "Nhập lỗi",
      failed: "Thất bại",
      "in-progress": "Đang thực hiện",
      "on-hold": "Tạm giữ",
      ready: "Sẵn sàng",
      received: "Đã tiếp nhận",
      rejected: "Từ chối",
      requested: "Đã yêu cầu"
    },
    status
  );
}

export function formatWorkflowTaskReferences(
  references: readonly WorkflowTaskReferenceLike[]
): string {
  if (references.length === 0) {
    return "Chưa gắn";
  }

  return references
    .map((reference) => `${reference.label ?? reference.resourceType}: ${reference.resourceType}/${reference.id}`)
    .join(" · ");
}

export function formatProcedureStatus(status: string): string {
  return labelOf(
    {
      preparation: "Chuẩn bị",
      "in-progress": "Đang thực hiện",
      "not-done": "Không thực hiện",
      "on-hold": "Tạm giữ",
      stopped: "Đã dừng",
      completed: "Hoàn tất",
      "entered-in-error": "Nhập lỗi",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatProcedureCategory(category: string): string {
  return labelOf(
    {
      surgical: "Phẫu thuật",
      diagnostic: "Chẩn đoán",
      therapeutic: "Điều trị",
      counseling: "Tư vấn",
      rehabilitation: "Phục hồi chức năng",
      other: "Khác"
    },
    category
  );
}

export function formatProcedurePerformers(performers: readonly ProcedurePerformerLike[]): string {
  if (performers.length === 0) {
    return "Chưa có";
  }

  return performers
    .map((performer) =>
      [
        `${performer.actorType}/${performer.actorId}`,
        performer.function?.display,
        performer.onBehalfOfOrganizationId ? `thay mặt ${performer.onBehalfOfOrganizationId}` : undefined
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

  return references.map((reference) => `${reference.resourceType}/${reference.id}`).join(", ");
}
