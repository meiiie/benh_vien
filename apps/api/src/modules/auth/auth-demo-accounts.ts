import type { ActorRole } from "@benh-vien-so/domain";
import { demoPasswordHash } from "./auth-password.js";

export type DemoAccount = {
  readonly username: string;
  readonly passwordHash: string;
  readonly actorId: string;
  readonly displayName: string;
  readonly role: ActorRole;
};

export const demoAccounts: readonly DemoAccount[] = [
  {
    username: "practitioner-demo-001",
    passwordHash: demoPasswordHash,
    actorId: "practitioner-demo-001",
    displayName: "Bác sĩ điều trị",
    role: "clinician"
  },
  {
    username: "nurse-demo-001",
    passwordHash: demoPasswordHash,
    actorId: "nurse-demo-001",
    displayName: "Điều dưỡng tiếp nhận",
    role: "nurse"
  },
  {
    username: "security-officer-demo",
    passwordHash: demoPasswordHash,
    actorId: "security-officer-demo",
    displayName: "Kiểm toán viên",
    role: "auditor"
  },
  {
    username: "admin-demo",
    passwordHash: demoPasswordHash,
    actorId: "admin-demo",
    displayName: "Quản trị hệ thống",
    role: "admin"
  },
  {
    username: "gateway-hai-phong-referral",
    passwordHash: demoPasswordHash,
    actorId: "system-hai-phong-referral-gateway",
    displayName: "Gateway liên thông BV tiếp nhận Hải Phòng",
    role: "integration"
  }
];
