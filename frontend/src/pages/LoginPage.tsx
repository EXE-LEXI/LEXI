import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import {
  getGoogleLoginUrl,
  requestPasswordReset,
  resetPassword,
} from "../api/auth";

type AuthPageProps = {
  mode: "login" | "register";
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (payload: {
    email: string;
    password: string;
    fullName?: string;
  }) => Promise<void>;
  onModeChange: (mode: "login" | "register") => void;
};

export function LoginPage({
  mode,
  isSubmitting,
  error,
  onSubmit,
  onModeChange,
}: AuthPageProps) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [featureNotice, setFeatureNotice] = useState<string | null>(null);
  const [isResetFlowOpen, setIsResetFlowOpen] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  function resetLocalState() {
    setLocalError(null);
    setFeatureNotice(null);
    setIsResetFlowOpen(false);
    setResetEmail("");
    setResetToken("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPassword("");
    setConfirmPassword("");
  }

  function handleToggleMode(targetMode: "login" | "register") {
    resetLocalState();
    onModeChange(targetMode);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    setFeatureNotice(null);

    const formData = new FormData(event.currentTarget);
    const emailValue = String(formData.get("email") ?? "");
    const passwordValue = String(formData.get("password") ?? "");
    const fullNameValue = String(formData.get("fullName") ?? "");

    if (isRegister) {
      const confirmPasswordValue = String(
        formData.get("confirmPassword") ?? ""
      );

      if (passwordValue !== confirmPasswordValue) {
        setLocalError("Mật khẩu và xác nhận mật khẩu không trùng khớp.");
        return;
      }

      if (!formData.get("agreeTerms")) {
        setLocalError(
          "Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật để tiếp tục."
        );
        return;
      }
    }

    await onSubmit({
      email: emailValue,
      password: passwordValue,
      fullName: isRegister ? fullNameValue : undefined,
    });
  }

  async function handleRequestReset() {
    setLocalError(null);
    setFeatureNotice(null);
    setIsResetSubmitting(true);

    try {
      const response = await requestPasswordReset(resetEmail);
      if (response.resetToken) {
        setResetToken(response.resetToken);
        setFeatureNotice(
          "Mã đặt lại mật khẩu đã được tạo cho môi trường thử nghiệm. Vui lòng nhập mật khẩu mới bên dưới."
        );
      } else {
        setFeatureNotice(
          "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi đến bạn."
        );
      }
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : "Không thể gửi yêu cầu đặt lại mật khẩu."
      );
    } finally {
      setIsResetSubmitting(false);
    }
  }

  async function handleConfirmReset() {
    setLocalError(null);
    setFeatureNotice(null);

    if (resetNewPassword !== resetConfirmPassword) {
      setLocalError("Mật khẩu mới và xác nhận mật khẩu không trùng khớp.");
      return;
    }

    setIsResetSubmitting(true);
    try {
      await resetPassword({
        token: resetToken,
        newPassword: resetNewPassword,
      });
      setFeatureNotice(
        "Đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập."
      );
      setIsResetFlowOpen(false);
      setResetEmail("");
      setResetToken("");
      setResetNewPassword("");
      setResetConfirmPassword("");
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Không thể đặt lại mật khẩu."
      );
    } finally {
      setIsResetSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    setLocalError(null);
    setFeatureNotice(null);
    window.location.href = getGoogleLoginUrl();
  }

  const activeError = localError || error;

  return (
    <div className="lexi-auth-root">
      <div className="lexi-auth-split-box">
        <div className="lexi-register-left-panel">
          <div className="lexi-register-left-logo">
            <span>LEXI</span>
          </div>

          <div className="lexi-register-left-intro">
            <h1>
              Làm chủ pháp luật.
              <br />
              Thăng hạng bản thân.
            </h1>
            <p>
              Tham gia cộng đồng học thuật pháp lý tương tác. Khám phá các bài
              học được thiết kế rõ ràng, thực tế và dễ áp dụng.
            </p>

            <div className="lexi-register-left-image-box">
              <img
                src="/lexi_register_gavel.png"
                alt="Minh họa học pháp lý cùng LEXI"
                className="lexi-register-left-image"
              />
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "var(--color-muted-text)" }}>
            © 2026 LEXI Legal Resources.
          </div>
        </div>

        <div className="lexi-register-right-panel">
          {isRegister ? (
            <div
              key="register-view"
              className="lexi-register-form-container lexi-quiz-feedback-box success lexi-animate-fade"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "inherit",
                margin: 0,
              }}
            >
              <h2>Tạo tài khoản</h2>
              <p className="subtitle">
                Bắt đầu hành trình chinh phục kiến thức pháp lý.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="lexi-auth-label">Họ và tên</label>
                <div className="lexi-auth-input-wrapper">
                  <User size={16} className="lexi-auth-input-icon" />
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <label className="lexi-auth-label">Địa chỉ email</label>
                <div className="lexi-auth-input-wrapper">
                  <Mail size={16} className="lexi-auth-input-icon" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <label className="lexi-auth-label">Mật khẩu</label>
                <div className="lexi-auth-input-wrapper">
                  <Lock size={16} className="lexi-auth-input-icon" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="lexi-auth-input-eye"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <label className="lexi-auth-label">Xác nhận mật khẩu</label>
                <div className="lexi-auth-input-wrapper">
                  <Lock size={16} className="lexi-auth-input-icon" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                  />
                  <button
                    className="lexi-auth-input-eye"
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                <label className="lexi-auth-checkbox-row">
                  <input name="agreeTerms" type="checkbox" required />
                  <span>
                    Tôi đồng ý với <strong>Điều khoản sử dụng</strong> và{" "}
                    <strong>Chính sách bảo mật</strong> của LEXI.
                  </span>
                </label>

                <AuthMessages error={activeError} notice={featureNotice} />

                <button
                  className="lexi-auth-btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting
                      ? "Đang tạo tài khoản..."
                      : "Đăng ký tài khoản"}
                  </span>
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>

                <div className="lexi-auth-switch-link">
                  Đã có tài khoản?
                  <strong onClick={() => handleToggleMode("login")}>
                    Đăng nhập ngay
                  </strong>
                </div>
              </form>
            </div>
          ) : (
            <div
              key="login-view"
              className="lexi-register-form-container lexi-animate-fade"
            >
              <h2>Đăng nhập</h2>
              <p className="subtitle">
                Nhập tài khoản để tiếp tục hành trình học pháp lý.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="lexi-auth-label">Địa chỉ email</label>
                <div className="lexi-auth-input-wrapper">
                  <Mail size={16} className="lexi-auth-input-icon" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Nhập địa chỉ email của bạn"
                    required
                  />
                </div>

                <div className="lexi-auth-label">
                  <span>Mật khẩu</span>
                  <button
                    className="lexi-auth-forgot-link"
                    type="button"
                    onClick={() => {
                      setLocalError(null);
                      setFeatureNotice(null);
                      setIsResetFlowOpen((value) => !value);
                    }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="lexi-auth-input-wrapper">
                  <Lock size={16} className="lexi-auth-input-icon" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    minLength={6}
                    required
                  />
                  <button
                    className="lexi-auth-input-eye"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <label className="lexi-auth-checkbox-row">
                  <input name="rememberMe" type="checkbox" />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                {isResetFlowOpen ? (
                  <div className="lexi-auth-reset-panel">
                    <label className="lexi-auth-label">Email khôi phục</label>
                    <div className="lexi-auth-input-wrapper">
                      <Mail size={16} className="lexi-auth-input-icon" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        placeholder="Nhập email cần đặt lại mật khẩu"
                      />
                    </div>
                    <button
                      className="lexi-social-btn"
                      type="button"
                      disabled={isResetSubmitting || !resetEmail}
                      onClick={handleRequestReset}
                    >
                      Gửi yêu cầu đặt lại mật khẩu
                    </button>

                    <label className="lexi-auth-label">Mã đặt lại</label>
                    <div className="lexi-auth-input-wrapper">
                      <Lock size={16} className="lexi-auth-input-icon" />
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(event) => setResetToken(event.target.value)}
                        placeholder="Dán mã từ email hoặc phản hồi thử nghiệm"
                      />
                    </div>

                    <label className="lexi-auth-label">Mật khẩu mới</label>
                    <div className="lexi-auth-input-wrapper">
                      <Lock size={16} className="lexi-auth-input-icon" />
                      <input
                        type="password"
                        minLength={6}
                        value={resetNewPassword}
                        onChange={(event) =>
                          setResetNewPassword(event.target.value)
                        }
                        placeholder="Tối thiểu 6 ký tự"
                      />
                    </div>

                    <label className="lexi-auth-label">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="lexi-auth-input-wrapper">
                      <Lock size={16} className="lexi-auth-input-icon" />
                      <input
                        type="password"
                        minLength={6}
                        value={resetConfirmPassword}
                        onChange={(event) =>
                          setResetConfirmPassword(event.target.value)
                        }
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>

                    <button
                      className="lexi-auth-btn-primary"
                      type="button"
                      disabled={
                        isResetSubmitting ||
                        !resetToken ||
                        resetNewPassword.length < 6 ||
                        !resetConfirmPassword
                      }
                      onClick={handleConfirmReset}
                    >
                      <span>
                        {isResetSubmitting
                          ? "Đang xử lý..."
                          : "Đặt lại mật khẩu"}
                      </span>
                    </button>
                  </div>
                ) : null}

                <AuthMessages error={activeError} notice={featureNotice} />

                <button
                  className="lexi-auth-btn-primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  </span>
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>

                <div className="lexi-auth-divider">
                  <span>Hoặc đăng nhập với</span>
                </div>

                <div className="lexi-social-btns-row">
                  <button
                    type="button"
                    className="lexi-social-btn"
                    disabled={isSubmitting}
                    onClick={handleGoogleLogin}
                  >
                    <img
                      src="https://img.icons8.com/color/48/google-logo.png"
                      alt="Biểu tượng Google"
                    />
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="lexi-social-btn"
                    onClick={() =>
                      setFeatureNotice(
                        "Đăng nhập Facebook chưa được kết nối. Vui lòng sử dụng email, mật khẩu hoặc Google."
                      )
                    }
                  >
                    <img
                      src="https://img.icons8.com/color/48/facebook-new.png"
                      alt="Biểu tượng Facebook"
                    />
                    <span>Facebook</span>
                  </button>
                </div>

                <div className="lexi-auth-switch-link">
                  Chưa có tài khoản?
                  <strong onClick={() => handleToggleMode("register")}>
                    Đăng ký ngay
                  </strong>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthMessages({
  error,
  notice,
}: {
  error: string | null;
  notice: string | null;
}) {
  return (
    <>
      {error ? (
        <div
          className="error-text"
          style={{ marginBottom: "20px", marginTop: "-8px" }}
        >
          <span>{error}</span>
        </div>
      ) : null}

      {notice ? (
        <div
          className="lexi-inline-notice"
          style={{ marginBottom: "20px", marginTop: "-8px" }}
        >
          <span>{notice}</span>
        </div>
      ) : null}
    </>
  );
}

export default LoginPage;
