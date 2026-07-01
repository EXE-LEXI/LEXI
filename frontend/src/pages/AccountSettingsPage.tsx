import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Key,
  Mail,
  RefreshCw,
  Save,
  Shield,
  User,
} from "lucide-react";
import type { AuthResponse } from "../types/auth";
import { changePassword, getMe, updateMe } from "../api/users";

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
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchUserData() {
      setIsProfileLoading(true);
      setProfileError(null);
      try {
        const user = await getMe(token);
        if (ignore) return;
        setFullName(user.profile?.fullName || "");
        setAvatarUrl(user.profile?.avatarUrl || "");
        setEmail(user.email || "");
      } catch {
        if (!ignore) setProfileError("Khong the tai thong tin ho so.");
      } finally {
        if (!ignore) setIsProfileLoading(false);
      }
    }

    void fetchUserData();
    return () => {
      ignore = true;
    };
  }, [token]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setIsProfileLoading(true);

    try {
      const updatedUser = await updateMe(token, {
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });

      setProfileSuccess("Da cap nhat ho so thanh cong.");

      if (session) {
        onUpdateSession({
          ...session,
          user: {
            ...session.user,
            profile: updatedUser.profile,
          },
        });
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Loi khi cap nhat ho so.");
    } finally {
      setIsProfileLoading(false);
    }
  }

  async function handleChangePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSecuritySuccess(null);
    setSecurityError(null);

    if (newPassword !== confirmPassword) {
      setSecurityError("Mat khau moi va xac nhan mat khau khong trung khop.");
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError("Mat khau moi phai co it nhat 6 ky tu.");
      return;
    }

    setIsSecurityLoading(true);
    try {
      await changePassword(token, {
        currentPassword,
        newPassword,
      });

      setSecuritySuccess("Da doi mat khau thanh cong.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSecurityError(
        err instanceof Error ? err.message : "Mat khau hien tai khong chinh xac."
      );
    } finally {
      setIsSecurityLoading(false);
    }
  }

  const initials = (fullName || email || "LX")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="lexi-account-root lexi-animate-fade">
      <div className="lexi-account-container">
        <header className="lexi-account-header">
          <span className="eyebrow">Ho so va bao mat</span>
          <h1>Cai dat tai khoan</h1>
          <p>
            Quan ly ten hien thi, anh dai dien va mat khau dang nhap cho tai khoan LEXI.
          </p>
        </header>

        <div className="lexi-account-grid">
          <aside className="lexi-account-tabs-nav">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={18} />
              <span>Ho so ca nhan</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={18} />
              <span>Bao mat</span>
            </button>
          </aside>

          <main className="lexi-account-workspace">
            {activeTab === "profile" ? (
              <form className="panel-card lexi-account-panel" onSubmit={handleUpdateProfile}>
                <div className="lexi-account-panel-heading">
                  <h2>Thong tin hien thi</h2>
                  <p>Ten va anh dai dien se duoc dung tren ho so, bang xep hang va binh luan.</p>
                </div>

                {profileSuccess ? (
                  <div className="status-toast success">
                    <CheckCircle size={16} />
                    <span>{profileSuccess}</span>
                  </div>
                ) : null}

                {profileError ? (
                  <div className="status-toast error">
                    <AlertCircle size={16} />
                    <span>{profileError}</span>
                  </div>
                ) : null}

                <div className="avatar-preview-block">
                  <div className="avatar-large">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" onError={() => setAvatarUrl("")} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="avatar-info">
                    <strong>Anh dai dien</strong>
                    <span>Dan URL anh hop le. Neu bo trong, he thong se hien chu cai dau ten.</span>
                  </div>
                </div>

                <div className="lexi-input-field-group">
                  <label htmlFor="fullName">Ho va ten</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Nguyen Van A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="lexi-input-field-group">
                  <label htmlFor="avatarUrl">URL anh dai dien</label>
                  <div className="input-wrapper">
                    <input
                      id="avatarUrl"
                      type="url"
                      placeholder="https://..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="lexi-input-field-group disabled">
                  <label htmlFor="email">Email dang nhap</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input id="email" type="email" disabled value={email} />
                  </div>
                  <span className="helper-text">Email dang nhap hien chua ho tro thay doi.</span>
                </div>

                <button className="lexi-btn-save" type="submit" disabled={isProfileLoading}>
                  {isProfileLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Dang luu...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Luu thay doi</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form className="panel-card lexi-account-panel" onSubmit={handleChangePasswordSubmit}>
                <div className="lexi-account-panel-heading">
                  <h2>Thay doi mat khau</h2>
                  <p>Dat mat khau moi co it nhat 6 ky tu de bao ve tai khoan.</p>
                </div>

                {securitySuccess ? (
                  <div className="status-toast success">
                    <CheckCircle size={16} />
                    <span>{securitySuccess}</span>
                  </div>
                ) : null}

                {securityError ? (
                  <div className="status-toast error">
                    <AlertCircle size={16} />
                    <span>{securityError}</span>
                  </div>
                ) : null}

                <div className="lexi-input-field-group">
                  <label htmlFor="currentPassword">Mat khau hien tai</label>
                  <div className="input-wrapper">
                    <Key size={16} className="input-icon" />
                    <input
                      id="currentPassword"
                      type="password"
                      required
                      placeholder="Nhap mat khau hien tai"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="lexi-input-field-group">
                  <label htmlFor="newPassword">Mat khau moi</label>
                  <div className="input-wrapper">
                    <Key size={16} className="input-icon" />
                    <input
                      id="newPassword"
                      type="password"
                      required
                      placeholder="Toi thieu 6 ky tu"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="lexi-input-field-group">
                  <label htmlFor="confirmPassword">Xac nhan mat khau moi</label>
                  <div className="input-wrapper">
                    <Key size={16} className="input-icon" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="Nhap lai mat khau moi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button className="lexi-btn-save" type="submit" disabled={isSecurityLoading}>
                  {isSecurityLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Dang cap nhat...</span>
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      <span>Cap nhat mat khau</span>
                    </>
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
