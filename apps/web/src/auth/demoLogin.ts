export type DemoRole = "clinician" | "nurse" | "auditor" | "admin" | "integration";

export type LoginForm = {
  readonly username: string;
  readonly password: string;
  readonly role: DemoRole;
};

export type DemoRoleOption = {
  readonly role: DemoRole;
  readonly label: string;
  readonly mission: string;
  readonly boundary: string;
};

export const loginPresets: Record<DemoRole, LoginForm> = {
  clinician: {
    username: "practitioner-demo-001",
    password: "demo",
    role: "clinician"
  },
  nurse: {
    username: "nurse-demo-001",
    password: "demo",
    role: "nurse"
  },
  auditor: {
    username: "security-officer-demo",
    password: "demo",
    role: "auditor"
  },
  admin: {
    username: "admin-demo",
    password: "demo",
    role: "admin"
  },
  integration: {
    username: "gateway-hai-phong-referral",
    password: "demo",
    role: "integration"
  }
};

export const demoRoleOptions: readonly DemoRoleOption[] = [
  {
    role: "clinician",
    label: "Bác sĩ điều trị",
    mission: "Tạo hồ sơ lâm sàng, tài liệu bệnh án và gói chuyển hồ sơ liên viện.",
    boundary: "Không đọc nhật ký kiểm toán hệ thống."
  },
  {
    role: "nurse",
    label: "Điều dưỡng tiếp nhận",
    mission: "Hỗ trợ tiếp nhận, xem danh bạ cơ sở và theo dõi hồ sơ theo phạm vi điều trị.",
    boundary: "Không xuất gói FHIR hoặc phê duyệt chuyển hồ sơ."
  },
  {
    role: "integration",
    label: "Gateway liên thông",
    mission: "Mô phỏng đầu nhận kỹ thuật khi bệnh viện khác gửi callback biên nhận.",
    boundary: "Không thao tác trực tiếp trên hồ sơ điều trị."
  },
  {
    role: "auditor",
    label: "Kiểm toán truy cập",
    mission: "Rà soát AuditEvent, kiểm tra chuỗi toàn vẹn và lịch sử truy cập dữ liệu nhạy cảm.",
    boundary: "Không chỉnh sửa bệnh án hoặc dữ liệu lâm sàng."
  },
  {
    role: "admin",
    label: "Quản trị hệ thống",
    mission: "Quản lý cấu hình demo, phạm vi tổ chức và tác vụ vận hành có kiểm soát.",
    boundary: "Không thay thế quy trình phê duyệt nghiệp vụ thật."
  }
];

export function getDemoRoleOption(role: DemoRole): DemoRoleOption {
  return demoRoleOptions.find((option) => option.role === role) ?? demoRoleOptions[0];
}

export function formatDemoRole(role: DemoRole): string {
  return getDemoRoleOption(role).label;
}
