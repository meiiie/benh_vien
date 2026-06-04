import type { DemoRole } from "../auth/demoLogin.js";
import type { AppRoute } from "../types/appRuntime.js";

export type AuthenticatedAppRoute = Exclude<AppRoute, "landing" | "login">;
export type AppNavigationRoute = AuthenticatedAppRoute;

export type AppNavigationItem = {
  readonly route: AppNavigationRoute;
  readonly label: string;
  readonly hint: string;
};

export const appNavigationItems: readonly AppNavigationItem[] = [
  { route: "dashboard", label: "Tổng quan", hint: "Vận hành" },
  { route: "workspace", label: "Hồ sơ bệnh nhân", hint: "Lượt khám" },
  { route: "documents", label: "Tài liệu", hint: "Bệnh án điện tử" },
  { route: "audit", label: "Kiểm toán", hint: "Nhật ký truy cập" },
  { route: "interop", label: "Liên thông", hint: "FHIR/HIS/LIS/PACS" },
  { route: "settings", label: "Cấu hình", hint: "Vai trò và bảo mật" }
];

export const integrationNavigationItem: AppNavigationItem = {
  route: "interop",
  label: "Gateway",
  hint: "Callback tiếp nhận"
};

export function getVisibleNavigationItems(
  userRole: DemoRole
): readonly AppNavigationItem[] {
  return userRole === "integration"
    ? [integrationNavigationItem]
    : appNavigationItems;
}

export function normalizeAuthenticatedRoute(
  route: AppRoute
): AuthenticatedAppRoute {
  return route === "landing" || route === "login" ? "dashboard" : route;
}
