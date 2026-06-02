import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import {
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
  
  // local states for passwords and validation
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [featureNotice, setFeatureNotice] = useState<string | null>(null);
  const [isResetFlowOpen, setIsResetFlowOpen] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  // Clear errors when toggling modes to make transitions feel clean
  function handleToggleMode(targetMode: "login" | "register") {
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
      const confirmPasswordValue = String(formData.get("confirmPassword") ?? "");
      if (passwordValue !== confirmPasswordValue) {
        setLocalError("Mật khẩu và xác nhận mật khẩu không trùng khớp!");
        return;
      }
      
      const agreeValue = formData.get("agreeTerms");
      if (!agreeValue) {
        setLocalError("Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật để tiếp tục!");
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
          "Mã đặt lại mật khẩu đã được tạo cho môi trường thử nghiệm này. Vui lòng kiểm tra và điền mật khẩu mới phía dưới."
        );
      } else {
        setFeatureNotice(
          "Nếu email này tồn tại và hệ thống gửi thư được định cấu hình, hướng dẫn đặt lại mật khẩu sẽ được gửi."
        );
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Không thể gửi yêu cầu đặt lại mật khẩu"
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
      setFeatureNotice("Đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập.");
      setIsResetFlowOpen(false);
      setResetEmail("");
      setResetToken("");
      setResetNewPassword("");
      setResetConfirmPassword("");
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Không thể đặt lại mật khẩu"
      );
    } finally {
      setIsResetSubmitting(false);
    }
  }

  const activeError = localError || error;

  return (
    <div className="lexi-auth-root">
      <div className="lexi-auth-split-box">
        
        {/* ==========================================
           LEFT SIDEBAR - Identical on both modes for unity
           ========================================== */}
        <div className="lexi-register-left-panel">
          <div className="lexi-register-left-logo">
            <span>LEXI</span>
          </div>
          
          <div className="lexi-register-left-intro">
            <h1>Làm Chủ Pháp Luật.<br />Thăng Hạng Bản Thân.</h1>
            <p>
              Tham gia cộng đồng học thuật pháp lý tương tác hàng đầu. Khám phá hàng ngàn bài học được thiết kế chuyên nghiệp, thú vị và hiệu quả.
            </p>
            
            <div className="lexi-register-left-image-box">
              <img 
                src="/lexi_register_gavel.png" 
                alt="Legal Gavel Mockup" 
                className="lexi-register-left-image"
              />
            </div>
          </div>
          
          <div style={{ fontSize: "11px", color: "var(--color-muted-text)" }}>
            © 2026 LEXI Legal Resources.
          </div>
        </div>

        {/* ==========================================
           RIGHT CONTENT PANEL - Smoothly toggles forms
           ========================================== */}
        <div className="lexi-register-right-panel">
          
          {isRegister ? (
            /* REGISTRATION FORM VIEW */
            <div key="register-view" className="lexi-register-form-container lexi-quiz-feedback-box success lexi-animate-fade" style={{ background: "none", border: "none", padding: 0, color: "inherit", margin: 0 }}>
              <h2>Tạo tài khoản</h2>
              <p className="subtitle">Bắt đầu hành trình chinh phục kiến thức pháp lý.</p>
              
              <form onSubmit={handleSubmit}>
                {/* Full name field */}
                <label className="lexi-auth-label">Họ và Tên</label>
                <div className="lexi-auth-input-wrapper">
                  <User size={16} className="lexi-auth-input-icon" />
                  <input 
                    name="fullName" 
                    type="text" 
                    placeholder="Nguyễn Văn A" 
                    required 
                  />
                </div>

                {/* Email field */}
                <label className="lexi-auth-label">Địa chỉ Email</label>
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

                {/* Password field */}
                <label className="lexi-auth-label">Mật khẩu</label>
                <div className="lexi-auth-input-wrapper">
                  <Lock size={16} className="lexi-auth-input-icon" />
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    minLength={6} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <div className="lexi-auth-input-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>

                {/* Confirm Password field */}
                <label className="lexi-auth-label">Xác nhận mật khẩu</label>
                <div className="lexi-auth-input-wrapper">
                  <Lock size={16} className="lexi-auth-input-icon" />
                  <input 
                    name="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    minLength={6} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                  <div className="lexi-auth-input-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>

                {/* Checkbox agree terms */}
                <label className="lexi-auth-checkbox-row">
                  <input name="agreeTerms" type="checkbox" defaultChecked required />
                  <span>
                    Tôi đồng ý với các <strong>Điều khoản sử dụng</strong> và <strong>Chính sách bảo mật</strong> của LEXI.
                  </span>
                </label>

                {activeError ? (
                  <div className="error-text" style={{ marginBottom: "20px", marginTop: "-8px" }}>
                    <span>{activeError}</span>
                  </div>
                ) : null}

                {featureNotice ? (
                  <div className="lexi-inline-notice" style={{ marginBottom: "20px", marginTop: "-8px" }}>
                    <span>{featureNotice}</span>
                  </div>
                ) : null}

                <button 
                  className="lexi-auth-btn-primary" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}</span>
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>

                <div className="lexi-auth-switch-link">
                  Đã có tài khoản? 
                  <strong onClick={() => handleToggleMode("login")}>Đăng nhập ngay</strong>
                </div>
              </form>
            </div>
          ) : (
            /* LOGIN FORM VIEW */
            <div key="login-view" className="lexi-register-form-container lexi-animate-fade">
              <h2>Đăng nhập</h2>
              <p className="subtitle">Nhập tài khoản để tiếp tục hành trình vượt ải.</p>
              
              <form onSubmit={handleSubmit}>
                {/* Email field */}
                <label className="lexi-auth-label">Địa chỉ Email</label>
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

                {/* Password field */}
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
                  <div className="lexi-auth-input-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </div>
                </div>

                {/* Checkbox Remember Me */}
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
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Nhập email cần đặt lại mật khẩu"
                      />
                    </div>
                    <button
                      className="lexi-social-btn"
                      type="button"
                      disabled={isResetSubmitting || !resetEmail}
                      onClick={handleRequestReset}
                    >
                      Gửi yêu cầu reset
                    </button>

                    <label className="lexi-auth-label">Reset token</label>
                    <div className="lexi-auth-input-wrapper">
                      <Lock size={16} className="lexi-auth-input-icon" />
                      <input
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Dán token từ email hoặc beta response"
                      />
                    </div>

                    <label className="lexi-auth-label">Mật khẩu mới</label>
                    <div className="lexi-auth-input-wrapper">
                      <Lock size={16} className="lexi-auth-input-icon" />
                      <input
                        type="password"
                        minLength={6}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự"
                      />
                    </div>

                    <label className="lexi-auth-label">Xác nhận mật khẩu mới</label>
                    <div className="lexi-auth-input-wrapper">
                      <Lock size={16} className="lexi-auth-input-icon" />
                      <input
                        type="password"
                        minLength={6}
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
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
                        {isResetSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                      </span>
                    </button>
                  </div>
                ) : null}

                {activeError ? (
                  <div className="error-text" style={{ marginBottom: "20px", marginTop: "-8px" }}>
                    <span>{activeError}</span>
                  </div>
                ) : null}

                {featureNotice ? (
                  <div className="lexi-inline-notice" style={{ marginBottom: "20px", marginTop: "-8px" }}>
                    <span>{featureNotice}</span>
                  </div>
                ) : null}

                <button 
                  className="lexi-auth-btn-primary" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</span>
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>

                {/* Social Divider */}
                <div className="lexi-auth-divider">
                  <span>Hoặc đăng nhập với</span>
                </div>

                {/* Social Row Buttons */}
                <div className="lexi-social-btns-row">
                  <button 
                    type="button" 
                    className="lexi-social-btn" 
                    onClick={() =>
                      setFeatureNotice(
                        "Đăng nhập Google chưa kết nối trong bản thử nghiệm này. Vui lòng sử dụng email và mật khẩu."
                      )
                    }
                  >
                    <img 
                      src="https://img.icons8.com/color/48/google-logo.png" 
                      alt="Google logo icon" 
                    />
                    <span>Google</span>
                  </button>
                  
                  <button 
                    type="button" 
                    className="lexi-social-btn" 
                    onClick={() =>
                      setFeatureNotice(
                        "Đăng nhập Facebook chưa kết nối trong bản thử nghiệm này. Vui lòng sử dụng email và mật khẩu."
                      )
                    }
                  >
                    <img 
                      src="https://img.icons8.com/color/48/facebook-new.png" 
                      alt="Facebook logo icon" 
                    />
                    <span>Facebook</span>
                  </button>
                </div>

                <div className="lexi-auth-switch-link">
                  Chưa có tài khoản? 
                  <strong onClick={() => handleToggleMode("register")}>Đăng ký ngay</strong>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
export default LoginPage;
