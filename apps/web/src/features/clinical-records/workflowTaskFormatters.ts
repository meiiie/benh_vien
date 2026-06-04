import { labelOf } from "./careWorkflowFormatterPrimitives.js";

type WorkflowTaskReferenceLike = {
  readonly id: string;
  readonly resourceType: string;
  readonly label?: string;
};

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
    .map(
      (reference) =>
        `${reference.label ?? reference.resourceType}: ${reference.resourceType}/${reference.id}`
    )
    .join(" · ");
}
