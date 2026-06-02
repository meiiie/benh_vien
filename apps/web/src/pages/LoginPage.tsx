import type { FormEvent } from "react";
import {
  demoRoleOptions,
  getDemoRoleOption,
  loginPresets,
  type DemoRole,
  type LoginForm
} from "../auth/demoLogin.js";

type LoginPageProps = {
  readonly error?: string;
  readonly form: LoginForm;
  readonly onBack: () => void;
  readonly onChange: (form: LoginForm) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginPage({
  error,
  form,
  onBack,
  onChange,
  onSubmit
}: LoginPageProps) {
  const selectedRole = getDemoRoleOption(form.role);

  return (
    <main className="login-shell">
      <section className="login-panel">
        <button className="ghost-button" type="button" onClick={onBack}>
          Quay lại trang giới thiệu
        </button>
        <div>
          <p className="eyebrow">Truy cập demo có kiểm soát</p>
          <h1>Đăng nhập WiiiCare Nexus</h1>
          <p className="lede">
            Đây là đăng nhập demo để trình bày luồng sản phẩm. Khi lên sản phẩm thật, lớp
            này cần thay bằng IAM/SSO (quản lý danh tính/đăng nhập một lần), MFA (xác thực đa yếu tố),
            quản lý phiên và chính sách bảo mật đầy đủ.
          </p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Tài khoản
            <input
              value={form.username}
              onChange={(event) => onChange({ ...form, username: event.target.value })}
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={form.password}
              onChange={(event) => onChange({ ...form, password: event.target.value })}
            />
          </label>
          <label>
            Vai trò demo
            <select
              value={form.role}
              onChange={(event) => onChange(loginPresets[event.target.value as DemoRole])}
            >
              {demoRoleOptions.map((option) => (
                <option key={option.role} value={option.role}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <section
            className="role-help"
            aria-live="polite"
            aria-label={`Giải thích vai trò demo: ${selectedRole.label}. ${selectedRole.mission} ${selectedRole.boundary}`}
          >
            <div>
              <span>Vai trò đang chọn: </span>
              <strong>{selectedRole.label}</strong>
            </div>
            <p>{selectedRole.mission}</p>
            <small>{selectedRole.boundary}</small>
          </section>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit">
            Đăng nhập demo
          </button>
        </form>
      </section>
    </main>
  );
}
