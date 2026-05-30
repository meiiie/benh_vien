import type { FormEvent } from "react";
import {
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
  return (
    <main className="login-shell">
      <section className="login-panel">
        <button className="ghost-button" type="button" onClick={onBack}>
          Quay lại landing
        </button>
        <div>
          <p className="eyebrow">Secure access</p>
          <h1>Đăng nhập WiiiCare Nexus</h1>
          <p className="lede">
            Đây là đăng nhập demo để trình bày luồng sản phẩm. Khi lên sản phẩm thật, lớp
            này cần thay bằng IAM/SSO, MFA, quản lý phiên và chính sách bảo mật đầy đủ.
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
              <option value="clinician">Bác sĩ / điều trị</option>
              <option value="nurse">Điều dưỡng / tiếp nhận</option>
              <option value="integration">Gateway liên thông</option>
              <option value="auditor">Kiểm toán</option>
              <option value="admin">Quản trị</option>
            </select>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit">
            Đăng nhập demo
          </button>
        </form>
      </section>
    </main>
  );
}
