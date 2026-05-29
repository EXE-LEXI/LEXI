import type { FormEvent } from "react";
import type { NotificationPreferences } from "../types/learning";

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
    <main className="page">
      <p className="eyebrow">Bảng Điều Khiển Liên Lạc</p>
      <h1>Nhắc học và thiết bị</h1>
      {isLoading ? <p className="notice">Đang tải cấu hình cài đặt...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="wide-grid">
        <form className="panel form settings-form" onSubmit={handleSubmit}>
          <h2>Cấu hình nhận thông báo</h2>
          <label className="toggle-row">
            <input
              name="dailyReminderEnabled"
              type="checkbox"
              defaultChecked={preferences?.dailyReminderEnabled}
            />
            Nhắc nhở học tập hàng ngày
          </label>
          <label className="toggle-row">
            <input
              name="streakReminderEnabled"
              type="checkbox"
              defaultChecked={preferences?.streakReminderEnabled}
            />
            Nhắc nhở duy trì chuỗi học (Streak)
          </label>
          <label className="toggle-row">
            <input
              name="reviewReminderEnabled"
              type="checkbox"
              defaultChecked={preferences?.reviewReminderEnabled}
            />
            Nhắc nhở ôn luyện bài cũ
          </label>
          <label>
            Giờ nhắc nhở học
            <input
              name="reminderHour"
              type="number"
              min="0"
              max="23"
              defaultValue={preferences?.reminderHour ?? 20}
            />
          </label>
          <label>
            Múi giờ hoạt động
            <input
              name="timezone"
              defaultValue={preferences?.timezone ?? "Asia/Ho_Chi_Minh"}
            />
          </label>
          <div className="two-fields">
            <label>
              Bắt đầu giờ yên tĩnh (Không thông báo)
              <input
                name="quietHoursStart"
                type="number"
                min="0"
                max="23"
                defaultValue={preferences?.quietHoursStart ?? ""}
              />
            </label>
            <label>
              Kết thúc giờ yên tĩnh
              <input
                name="quietHoursEnd"
                type="number"
                min="0"
                max="23"
                defaultValue={preferences?.quietHoursEnd ?? ""}
              />
            </label>
          </div>
          <button className="button button-primary" type="submit">
            Lưu cấu hình thông báo
          </button>
        </form>

        <article className="panel">
          <h2>Mã định danh thiết bị (Device Token)</h2>
          <p className="muted">
            Dán mã Firebase registration token để kiểm thử hệ thống gửi nhận thông báo đẩy trực tiếp từ máy chủ backend.
          </p>
          <label className="form">
            Mã định danh Web token
            <input
              value={deviceToken}
              onChange={(event) => onDeviceTokenChange(event.target.value)}
            />
          </label>
          <div className="button-row">
            <button
              className="button button-primary"
              type="button"
              disabled={!deviceToken}
              onClick={onRegisterDeviceToken}
            >
              Đăng ký thiết bị
            </button>
            <button
              className="button button-secondary"
              type="button"
              disabled={!deviceToken}
              onClick={onRevokeDeviceToken}
            >
              Hủy liên kết
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
export default SettingsPage;
