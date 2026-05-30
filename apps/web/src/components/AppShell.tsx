import type { ReactNode } from "react";
import { formatDemoRole, type DemoRole } from "../auth/demoLogin.js";

type AppNavigationRoute = "dashboard" | "workspace" | "documents" | "audit" | "interop" | "settings";

const navigationItems: readonly {
  readonly route: AppNavigationRoute;
  readonly label: string;
  readonly hint: string;
}[] = [
  { route: "dashboard", label: "Tổng quan", hint: "Vận hành" },
  { route: "workspace", label: "Hồ sơ bệnh nhân", hint: "Lượt khám" },
  { route: "documents", label: "Tài liệu", hint: "Bệnh án điện tử" },
  { route: "audit", label: "Kiểm toán", hint: "Nhật ký truy cập" },
  { route: "interop", label: "Liên thông", hint: "FHIR/HIS/LIS/PACS" },
  { route: "settings", label: "Cấu hình", hint: "Vai trò và bảo mật" }
];

type AuthenticatedLayoutProps = {
  readonly apiBaseUrl: string;
  readonly children: ReactNode;
  readonly currentRoute: string;
  readonly onLogout: () => void;
  readonly onNavigate: (route: AppNavigationRoute) => void;
  readonly statusMessage: string;
  readonly userName: string;
  readonly userRole: DemoRole;
};

export function AuthenticatedLayout({
  apiBaseUrl,
  children,
  currentRoute,
  onLogout,
  onNavigate,
  statusMessage,
  userName,
  userRole
}: AuthenticatedLayoutProps) {
  const visibleNavigationItems =
    userRole === "integration"
      ? [
          {
            route: "interop" as const,
            label: "Gateway",
            hint: "Callback tiếp nhận"
          }
        ]
      : navigationItems;

  return (
    <main className="app-layout">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span>WiiiCare</span>
          <strong>Nexus</strong>
        </div>
        <nav className="app-nav" aria-label="Điều hướng ứng dụng">
          {visibleNavigationItems.map((item) => (
            <button
              className={currentRoute === item.route ? "selected" : ""}
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
            >
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </button>
          ))}
        </nav>
        <button className="ghost-button logout-button" type="button" onClick={onLogout}>
          Đăng xuất
        </button>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <div>
            <span>{apiBaseUrl}</span>
            <strong>{statusMessage}</strong>
          </div>
          <div className="user-chip">
            <span>{formatDemoRole(userRole)}</span>
            <strong>{userName}</strong>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

export function PageHeader({
  description,
  eyebrow,
  title
}: {
  readonly description: string;
  readonly eyebrow: string;
  readonly title: string;
}) {
  return (
    <section className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lede">{description}</p>
    </section>
  );
}

export function MetricCard({
  label,
  note,
  value
}: {
  readonly label: string;
  readonly note: string;
  readonly value: string;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function FhirPanel({
  title,
  badge,
  value
}: {
  readonly title: string;
  readonly badge: string;
  readonly value: unknown;
}) {
  return (
    <article className="panel fhir-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FHIR facade</p>
          <h2>{title}</h2>
        </div>
        <span className="pill gold">{badge}</span>
      </div>
      <pre>{JSON.stringify(value ?? { note: "Chọn dữ liệu ở workspace để xuất FHIR." }, null, 2)}</pre>
    </article>
  );
}

export function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
