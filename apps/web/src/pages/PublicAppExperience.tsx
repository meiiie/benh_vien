import type { FormEvent } from "react";
import type { LoginForm } from "../auth/demoLogin.js";
import type { AppRoute } from "../types/appRuntime.js";
import { LandingPage } from "./LandingPage.js";
import { LoginPage } from "./LoginPage.js";

type PublicAppExperienceProps = {
  readonly appRoute: AppRoute;
  readonly loginError?: string;
  readonly loginForm: LoginForm;
  readonly onBackToLanding: () => void;
  readonly onDemo: () => void;
  readonly onLogin: () => void;
  readonly onLoginFormChange: (form: LoginForm) => void;
  readonly onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PublicAppExperience({
  appRoute,
  loginError,
  loginForm,
  onBackToLanding,
  onDemo,
  onLogin,
  onLoginFormChange,
  onLoginSubmit
}: PublicAppExperienceProps) {
  if (appRoute === "login") {
    return (
      <LoginPage
        form={loginForm}
        error={loginError}
        onBack={onBackToLanding}
        onChange={onLoginFormChange}
        onSubmit={onLoginSubmit}
      />
    );
  }

  return <LandingPage onDemo={onDemo} onLogin={onLogin} />;
}
