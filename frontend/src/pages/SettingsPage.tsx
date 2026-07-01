import type { FormEvent } from "react";
import type { NotificationPreferences } from "../types/learning";
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Globe,
  Moon,
  RefreshCw,
  Save,
  Smartphone,
  Unlink,
} from "lucide-react";

type SettingsPageProps = {
  preferences: NotificationPreferences | null;
  deviceToken: string;
  isLoading: boolean;
  error: string | null;
  onSavePreferences: (payload: Partial<NotificationPreferences>) => void;
  onDeviceTokenChange: (value: string) => void;
  onRegisterDeviceToken: () => void;
  onRevokeDeviceToken: () => void;
};

export function SettingsPage({
  preferences,
  deviceToken,
  isLoading,
  error,
  onSavePreferences,
  onDeviceTokenChange,
  onRegisterDeviceToken,
  onRevokeDeviceToken,
}: SettingsPageProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    onSavePreferences({
      dailyReminderEnabled: formData.get("dailyReminderEnabled") === "on",
      streakReminderEnabled: formData.get("streakReminderEnabled") === "on",
      reviewReminderEnabled: formData.get("reviewReminderEnabled") === "on",
      reminderHour: Number(formData.get("reminderHour") ?? 20),
      timezone: String(formData.get("timezone") ?? "Asia/Ho_Chi_Minh"),
      quietHoursStart: formData.get("quietHoursStart")
        ? Number(formData.get("quietHoursStart"))
        : null,
      quietHoursEnd: formData.get("quietHoursEnd")
        ? Number(formData.get("quietHoursEnd"))
        : null,
    });
  }

  return (
    <main className="lexi-settings-container">
      <div className="lexi-settings-header">
        <span className="eyebrow">Cau hinh tai khoan</span>
        <h1>Thiet lap nhac nho va thiet bi</h1>
        <p>
          Tuy chinh thoi gian nhan thong bao hoc tap, gio yen tinh va ma thiet bi dung
          de dong bo thong bao day tu may chu LEXI.
        </p>
      </div>

      {isLoading ? (
        <div className="lexi-settings-status loading">
          <RefreshCw className="animate-spin" size={16} />
          <span>Dang dong bo cau hinh voi may chu...</span>
        </div>
      ) : null}

      {error ? (
        <div className="lexi-settings-status error">
          <AlertCircle size={16} />
          <span>Loi: {error}</span>
        </div>
      ) : null}

      <div className="lexi-settings-grid">
        <form className="panel lexi-settings-panel" onSubmit={handleSubmit}>
          <h2>
            <Bell size={20} />
            <span>Thong bao hoc tap</span>
          </h2>

          <div className="lexi-switch-list">
            <label className="lexi-switch-wrapper">
              <div className="lexi-switch-info">
                <span className="lexi-switch-title">Nhac hoc hang ngay</span>
                <span className="lexi-switch-desc">
                  Gui thong bao de ban duy tri nhip hoc va khong bo lo bai moi.
                </span>
              </div>
              <div className="lexi-switch-control">
                <input
                  name="dailyReminderEnabled"
                  type="checkbox"
                  defaultChecked={preferences?.dailyReminderEnabled}
                  className="lexi-switch-input"
                />
                <span className="lexi-switch-slider" />
              </div>
            </label>

            <label className="lexi-switch-wrapper">
              <div className="lexi-switch-info">
                <span className="lexi-switch-title">Nhac duy tri streak</span>
                <span className="lexi-switch-desc">
                  Canh bao khi ban sap mat chuoi hoc lien tuc de kip quay lai on tap.
                </span>
              </div>
              <div className="lexi-switch-control">
                <input
                  name="streakReminderEnabled"
                  type="checkbox"
                  defaultChecked={preferences?.streakReminderEnabled}
                  className="lexi-switch-input"
                />
                <span className="lexi-switch-slider" />
              </div>
            </label>

            <label className="lexi-switch-wrapper">
              <div className="lexi-switch-info">
                <span className="lexi-switch-title">Nhac on luyen bai cu</span>
                <span className="lexi-switch-desc">
                  Goi y on lai cac cau tra loi sai va bai hoc da lau chua xem.
                </span>
              </div>
              <div className="lexi-switch-control">
                <input
                  name="reviewReminderEnabled"
                  type="checkbox"
                  defaultChecked={preferences?.reviewReminderEnabled}
                  className="lexi-switch-input"
                />
                <span className="lexi-switch-slider" />
              </div>
            </label>
          </div>

          <div className="lexi-form-field">
            <label htmlFor="reminderHour">
              <Clock size={16} />
              <span>Gio nhac hoc</span>
            </label>
            <div className="lexi-input-wrapper">
              <input
                id="reminderHour"
                name="reminderHour"
                type="number"
                min="0"
                max="23"
                defaultValue={preferences?.reminderHour ?? 20}
                className="lexi-settings-input"
              />
              <span className="lexi-input-suffix">gio</span>
            </div>
          </div>

          <div className="lexi-form-field">
            <label htmlFor="timezone">
              <Globe size={16} />
              <span>Mui gio</span>
            </label>
            <input
              id="timezone"
              name="timezone"
              defaultValue={preferences?.timezone ?? "Asia/Ho_Chi_Minh"}
              className="lexi-settings-input"
            />
          </div>

          <div className="lexi-settings-row-2">
            <div className="lexi-form-field">
              <label htmlFor="quietHoursStart">
                <Moon size={16} />
                <span>Bat dau gio yen tinh</span>
              </label>
              <div className="lexi-input-wrapper">
                <input
                  id="quietHoursStart"
                  name="quietHoursStart"
                  type="number"
                  min="0"
                  max="23"
                  placeholder="Khong cau hinh"
                  defaultValue={preferences?.quietHoursStart ?? ""}
                  className="lexi-settings-input"
                />
                <span className="lexi-input-suffix">gio</span>
              </div>
            </div>

            <div className="lexi-form-field">
              <label htmlFor="quietHoursEnd">
                <Moon size={16} />
                <span>Ket thuc gio yen tinh</span>
              </label>
              <div className="lexi-input-wrapper">
                <input
                  id="quietHoursEnd"
                  name="quietHoursEnd"
                  type="number"
                  min="0"
                  max="23"
                  placeholder="Khong cau hinh"
                  defaultValue={preferences?.quietHoursEnd ?? ""}
                  className="lexi-settings-input"
                />
                <span className="lexi-input-suffix">gio</span>
              </div>
            </div>
          </div>

          <button className="lexi-btn-save-settings" type="submit" disabled={isLoading}>
            <Save size={16} />
            <span>Luu cau hinh thong bao</span>
          </button>
        </form>

        <div className="panel lexi-settings-panel">
          <h2>
            <Smartphone size={20} />
            <span>Ma dinh danh thiet bi</span>
          </h2>

          <p className="lexi-settings-help">
            Dan Firebase Cloud Messaging registration token de kiem thu thong bao day
            truc tiep tren trinh duyet dang dung.
          </p>

          <div className="lexi-form-field">
            <label htmlFor="deviceToken">
              <Smartphone size={16} />
              <span>Web token</span>
            </label>
            <textarea
              id="deviceToken"
              placeholder="Nhap hoac dan Firebase Cloud Messaging token tai day..."
              value={deviceToken}
              onChange={(event) => onDeviceTokenChange(event.target.value)}
              className="lexi-settings-textarea"
              rows={5}
            />
          </div>

          <div className="lexi-btn-row">
            <button
              className="lexi-btn-action-primary"
              type="button"
              disabled={!deviceToken.trim() || isLoading}
              onClick={onRegisterDeviceToken}
            >
              <CheckCircle size={16} />
              <span>Dang ky</span>
            </button>

            <button
              className="lexi-btn-action-secondary"
              type="button"
              disabled={!deviceToken.trim() || isLoading}
              onClick={onRevokeDeviceToken}
            >
              <Unlink size={16} />
              <span>Huy lien ket</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SettingsPage;
