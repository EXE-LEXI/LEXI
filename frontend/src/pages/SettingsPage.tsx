import type { FormEvent } from "react";
import type { NotificationPreferences } from "../types/learning";
import {
  Bell,
  Smartphone,
  Clock,
  Globe,
  Moon,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Save,
  Unlink
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
        <span className="eyebrow">Cấu Hình Tài Khoản</span>
        <h1>Thiết Lập Nhắc Nhở & Thiết Bị</h1>
        <p>Tùy chỉnh thời gian nhận thông báo học tập và cấu hình mã định danh để đồng bộ hóa bài học thời gian thực.</p>
      </div>

      {isLoading ? (
        <div className="lexi-settings-status loading">
          <RefreshCw className="animate-spin" size={16} />
          <span>Đang đồng bộ hóa cấu hình với máy chủ...</span>
        </div>
      ) : null}
      
      {error ? (
        <div className="lexi-settings-status error">
          <AlertCircle size={16} />
          <span>Lỗi: {error}</span>
        </div>
      ) : null}

      <div className="lexi-settings-grid">
        {/* Left Column: Notification config */}
        <form className="panel lexi-settings-panel" onSubmit={handleSubmit}>
          <h2>
            <Bell size={20} />
            <span>Cấu hình nhận thông báo</span>
          </h2>

          <div className="lexi-switch-list">
            <label className="lexi-switch-wrapper">
              <div className="lexi-switch-info">
                <span className="lexi-switch-title">Nhắc nhở học tập hàng ngày</span>
                <span className="lexi-switch-desc">Nhận thông báo nhắc nhở rèn luyện các bài học mới để không bỏ lỡ kiến thức.</span>
              </div>
              <div className="lexi-switch-control">
                <input
                  name="dailyReminderEnabled"
                  type="checkbox"
                  defaultChecked={preferences?.dailyReminderEnabled}
                  className="lexi-switch-input"
                />
                <span className="lexi-switch-slider"></span>
              </div>
            </label>

            <label className="lexi-switch-wrapper">
              <div className="lexi-switch-info">
                <span className="lexi-switch-title">Nhắc nhở duy trì chuỗi học (Streak)</span>
                <span className="lexi-switch-desc">Thông báo nhắc nhở khi bạn sắp mất chuỗi học tập liên tục để giữ vững phong độ.</span>
              </div>
              <div className="lexi-switch-control">
                <input
                  name="streakReminderEnabled"
                  type="checkbox"
                  defaultChecked={preferences?.streakReminderEnabled}
                  className="lexi-switch-input"
                />
                <span className="lexi-switch-slider"></span>
              </div>
            </label>

            <label className="lexi-switch-wrapper">
              <div className="lexi-switch-info">
                <span className="lexi-switch-title">Nhắc nhở ôn luyện bài cũ</span>
                <span className="lexi-switch-desc">Gợi ý ôn tập định kỳ các câu hỏi sai hoặc các bài học đã lâu chưa đọc lại.</span>
              </div>
              <div className="lexi-switch-control">
                <input
                  name="reviewReminderEnabled"
                  type="checkbox"
                  defaultChecked={preferences?.reviewReminderEnabled}
                  className="lexi-switch-input"
                />
                <span className="lexi-switch-slider"></span>
              </div>
            </label>
          </div>

          <div className="lexi-form-field">
            <label htmlFor="reminderHour">
              <Clock size={16} />
              <span>Giờ nhắc nhở học</span>
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
              <span className="lexi-input-suffix">giờ</span>
            </div>
          </div>

          <div className="lexi-form-field">
            <label htmlFor="timezone">
              <Globe size={16} />
              <span>Múi giờ hoạt động</span>
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
                <span>Bắt đầu giờ yên tĩnh</span>
              </label>
              <div className="lexi-input-wrapper">
                <input
                  id="quietHoursStart"
                  name="quietHoursStart"
                  type="number"
                  min="0"
                  max="23"
                  placeholder="Không cấu hình"
                  defaultValue={preferences?.quietHoursStart ?? ""}
                  className="lexi-settings-input"
                />
                <span className="lexi-input-suffix">giờ</span>
              </div>
            </div>

            <div className="lexi-form-field">
              <label htmlFor="quietHoursEnd">
                <Moon size={16} />
                <span>Kết thúc giờ yên tĩnh</span>
              </label>
              <div className="lexi-input-wrapper">
                <input
                  id="quietHoursEnd"
                  name="quietHoursEnd"
                  type="number"
                  min="0"
                  max="23"
                  placeholder="Không cấu hình"
                  defaultValue={preferences?.quietHoursEnd ?? ""}
                  className="lexi-settings-input"
                />
                <span className="lexi-input-suffix">giờ</span>
              </div>
            </div>
          </div>

          <button className="lexi-btn-save-settings" type="submit">
            <Save size={16} />
            <span>Lưu cấu hình thông báo</span>
          </button>
        </form>

        {/* Right Column: Device configuration (Device Token) */}
        <div className="panel lexi-settings-panel">
          <h2>
            <Smartphone size={20} />
            <span>Mã định danh thiết bị</span>
          </h2>
          
          <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.55", margin: 0, fontWeight: 550 }}>
            Kết nối thiết bị của bạn bằng Firebase Cloud Messaging registration token để kiểm thử hệ thống gửi nhận thông báo đẩy trực tiếp từ máy chủ LEXI.
          </p>

          <div className="lexi-form-field">
            <label htmlFor="deviceToken">
              <Smartphone size={16} />
              <span>Mã định danh Web token</span>
            </label>
            <textarea
              id="deviceToken"
              placeholder="Nhập hoặc dán Firebase Cloud Messaging token tại đây..."
              value={deviceToken}
              onChange={(event) => onDeviceTokenChange(event.target.value)}
              className="lexi-settings-textarea"
              rows={4}
            />
          </div>

          <div className="lexi-btn-row">
            <button
              className="lexi-btn-action-primary"
              type="button"
              disabled={!deviceToken}
              onClick={onRegisterDeviceToken}
            >
              <CheckCircle size={16} />
              <span>Đăng ký</span>
            </button>
            
            <button
              className="lexi-btn-action-secondary"
              type="button"
              disabled={!deviceToken}
              onClick={onRevokeDeviceToken}
            >
              <Unlink size={16} />
              <span>Hủy liên kết</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
export default SettingsPage;

