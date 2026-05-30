export type DemoRole = "clinician" | "nurse" | "auditor" | "admin" | "integration";

export type LoginForm = {
  readonly username: string;
  readonly password: string;
  readonly role: DemoRole;
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

export function formatDemoRole(role: DemoRole): string {
  const labels: Record<DemoRole, string> = {
    admin: "Quản trị",
    auditor: "Kiểm toán",
    clinician: "Bác sĩ điều trị",
    integration: "Gateway liên thông",
    nurse: "Điều dưỡng tiếp nhận"
  };

  return labels[role];
}
