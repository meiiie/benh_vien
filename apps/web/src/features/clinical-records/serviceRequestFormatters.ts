import { labelOf } from "./careWorkflowFormatterPrimitives.js";

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
