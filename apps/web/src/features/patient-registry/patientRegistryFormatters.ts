type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatGender(gender: string): string {
  return labelOf(
    {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
      unknown: "Chưa rõ"
    },
    gender
  );
}

export function formatPatientRecordStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Ngừng hoạt động",
      merged: "Đã merge"
    },
    status
  );
}

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function formatIdentifierType(type: string): string {
  return labelOf(
    {
      "national-id": "Định danh cá nhân",
      "insurance-id": "BHYT",
      "hospital-mrn": "MRN",
      "legacy-id": "Mã cũ"
    },
    type
  );
}
