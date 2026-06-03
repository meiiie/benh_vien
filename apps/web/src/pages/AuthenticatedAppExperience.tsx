import type { DemoRole } from "../auth/demoLogin.js";
import { AuthenticatedLayout } from "../components/AppShell.js";
import type { AppNavigationRoute } from "../config/appNavigation.js";
import { AppRouteRenderer } from "./AppRouteRenderer.js";
import type { AppRouteRendererProps } from "./AppRouteRendererTypes.js";

type AuthenticatedAppExperienceProps = AppRouteRendererProps & {
  readonly currentRoute: AppNavigationRoute;
  readonly statusMessage: string;
  readonly userName: string;
  readonly userRole: DemoRole;
  readonly onLogout: () => void;
  readonly onShellNavigate: (route: AppNavigationRoute) => void;
};

export function AuthenticatedAppExperience({
  currentRoute,
  onLogout,
  onShellNavigate,
  statusMessage,
  userName,
  userRole,
  ...routeRendererProps
}: AuthenticatedAppExperienceProps) {
  return (
    <AuthenticatedLayout
      apiBaseUrl={routeRendererProps.apiBaseUrl}
      currentRoute={currentRoute}
      userRole={userRole}
      userName={userName}
      onLogout={onLogout}
      onNavigate={onShellNavigate}
      statusMessage={statusMessage}
    >
      <AppRouteRenderer {...routeRendererProps} />
    </AuthenticatedLayout>
  );
}
