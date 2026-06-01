import React, { useState, useEffect } from "react";
import { User, Shield, CheckCircle, RefreshCw, AlertCircle, Mail, Key } from "lucide-react";
import type { AuthResponse } from "../types/auth";
import { getMe, updateMe, changePassword } from "../api/users";

type AccountSettingsPageProps = {
  token: string;
  session: AuthResponse | null;
  onUpdateSession: (updatedUser: any) => void;
};

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  token,
  session,
  onUpdateSession,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
  // Profile state
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsProfileLoading(true);
      try {
        const user = await getMe(token);
        setFullName(user.profile?.fullName || "");
        setAvatarUrl(user.profile?.avatarUrl || "");
        setEmail(user.email || "");
      } catch (err: any) {
        setProfileError("Không thể tải thông tin hồ sơ.");
      } finally {
        setIsProfileLoading(false);
      }
    };

    void fetchUserData();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setIsProfileLoading(true);

    try {
      const updatedUser = await updateMe(token, {
        fullName,
        avatarUrl: avatarUrl || null,
      });

      setProfileSuccess("Cập nhật thông tin hồ sơ thành công!");
      
      // Update parent session to ensure Topbar & other components sync immediately
      if (session) {
        onUpdateSession({
          ...session,
          user: {
            ...session.user,
            profile: updatedUser.profile,
          },
        });
      }
    } catch (err: any) {
      setProfileError(err.message || "Lỗi khi cập nhật hồ sơ.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess(null);
    setSecurityError(null);

    if (newPassword !== confirmPassword) {
      setSecurityError("Mật khẩu mới và xác nhận mật khẩu không trùng khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    setIsSecurityLoading(true);
    try {
      await changePassword(token, {
        currentPassword,
        newPassword,
      });

      setSecuritySuccess("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setSecurityError(err.message || "Mật khẩu hiện tại không chính xác.");
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return (name || "Learner")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="lexi-account-root lexi-animate-fade">
      <div className="lexi-account-container">
        
        {/* Header */}
        <header className="lexi-account-header">
          <span className="eyebrow">Hồ Sơ & Bảo Mật</span>
          <h1>Cài Đặt Tài Khoản</h1>
          <p>Quản lý thông tin hiển thị cá nhân và thiết lập mật khẩu bảo mật tài khoản.</p>
        </header>

        {/* Workspace Layout */}
        <div className="lexi-account-grid">
          
          {/* Left Navigation Tabs */}
          <aside className="lexi-account-tabs-nav">
            <button
              className={`nav-tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} />
              <span>Hồ sơ cá nhân</span>
            </button>
            
            <button
              className={`nav-tab-btn ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={18} />
              <span>Bảo mật tài khoản</span>
            </button>
          </aside>

          {/* Right Panels Workspace */}
          <main className="lexi-account-workspace">
            {activeTab === "profile" ? (
              
              /* ── TAB 1: PROFILE FORM ── */
              <form className="panel-card" onSubmit={handleUpdateProfile}>
                <h2>Thông tin hiển thị</h2>
                <p className="panel-subtitle">Thông tin này được hiển thị công khai trên Bảng xếp hạng và trang cá nhân.</p>

                {profileSuccess && (
                  <div className="status-toast success">
                    <CheckCircle size={16} />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="status-toast error">
                    <AlertCircle size={16} />
                    <span>{profileError}</span>
                  </div>
                )}

                {/* Avatar Preview block */}
                <div className="avatar-preview-block">
                  <div className="avatar-large">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="User Avatar" onError={() => setAvatarUrl("")} />
                    ) : (
                      <span>{getInitials(fullName)}</span>
                    )}
                  </div>
                  <div className="avatar-info">
                    <strong>Ảnh đại diện</strong>
                    <span>Dán địa chỉ liên kết ảnh (.jpg, .png) vào ô phía dưới để cập nhật.</span>
                  </div>
                </div>

                {/* Input 1: Full name */}
                <div className="lexi-input-field-group">
                  <label htmlFor="fullName">Họ và Tên</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Input 2: Avatar URL */}
                <div className="lexi-input-field-group">
                  <label htmlFor="avatarUrl">Liên kết ảnh đại diện (URL)</label>
                  <div className="input-wrapper">
                    <input
                      id="avatarUrl"
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Input 3: Email (Readonly) */}
                <div className="lexi-input-field-group disabled">
                  <label htmlFor="email">Địa chỉ Email (Không thể thay đổi)</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="email"
                      type="email"
                      disabled
                      value={email}
                    />
                  </div>
                  <span className="helper-text">Liên hệ bộ phận kỹ thuật hỗ trợ nếu cần đổi email.</span>
                </div>

                {/* Save CTA */}
                <button className="lexi-btn-save" type="submit" disabled={isProfileLoading}>
                  {isProfileLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu thay đổi</span>
                  )}
                </button>
              </form>
            ) : (
              
              /* ── TAB 2: SECURITY FORM ── */
              <form className="panel-card" onSubmit={handleChangePasswordSubmit}>
                <h2>Thay đổi mật khẩu</h2>
                <p className="panel-subtitle">Tạo mật khẩu mạnh mẽ có ít nhất 6 ký tự để giữ an toàn cho tài khoản của bạn.</p>

                {securitySuccess && (
                  <div className="status-toast success">
                    <CheckCircle size={16} />
                    <span>{securitySuccess}</span>
                  </div>
                )}

                {securityError && (
                  <div className="status-toast error">
                    <AlertCircle size={16} />
                    <span>{securityError}</span>
                  </div>
                )}

                {/* Input 1: Current password */}
                <div className="lexi-input-field-group">
                  <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                  <div className="input-wrapper">
                    <Key size={16} className="input-icon" />
                    <input
                      id="currentPassword"
                      type="password"
                      required
                      placeholder="Nhập mật khẩu hiện tại"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Input 2: New password */}
                <div className="lexi-input-field-group">
                  <label htmlFor="newPassword">Mật khẩu mới</label>
                  <div className="input-wrapper">
                    <Key size={16} className="input-icon" />
                    <input
                      id="newPassword"
                      type="password"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Input 3: Confirm new password */}
                <div className="lexi-input-field-group">
                  <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                  <div className="input-wrapper">
                    <Key size={16} className="input-icon" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Save CTA */}
                <button className="lexi-btn-save" type="submit" disabled={isSecurityLoading}>
                  {isSecurityLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <span>Cập nhật mật khẩu</span>
                  )}
                </button>
              </form>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};
export default AccountSettingsPage;
