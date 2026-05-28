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
      <p className="eyebrow">Comms Console</p>
      <h1>Nhac hoc va thiet bi</h1>
      {isLoading ? <p className="notice">Loading settings...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="wide-grid">
        <form className="panel form settings-form" onSubmit={handleSubmit}>
          <h2>Notification Preferences</h2>
          <label className="toggle-row">
            <input
              name="dailyReminderEnabled"
              type="checkbox"
              defaultChecked={preferences?.dailyReminderEnabled}
            />
            Daily reminder
          </label>
          <label className="toggle-row">
            <input
              name="streakReminderEnabled"
              type="checkbox"
              defaultChecked={preferences?.streakReminderEnabled}
            />
            Streak reminder
          </label>
          <label className="toggle-row">
            <input
              name="reviewReminderEnabled"
              type="checkbox"
              defaultChecked={preferences?.reviewReminderEnabled}
            />
            Review reminder
          </label>
          <label>
            Reminder hour
            <input
              name="reminderHour"
              type="number"
              min="0"
              max="23"
              defaultValue={preferences?.reminderHour ?? 20}
            />
          </label>
          <label>
            Timezone
            <input
              name="timezone"
              defaultValue={preferences?.timezone ?? "Asia/Ho_Chi_Minh"}
            />
          </label>
          <div className="two-fields">
            <label>
              Quiet start
              <input
                name="quietHoursStart"
                type="number"
                min="0"
                max="23"
                defaultValue={preferences?.quietHoursStart ?? ""}
              />
            </label>
            <label>
              Quiet end
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
            Save comms
          </button>
        </form>

        <article className="panel">
          <h2>Device Token</h2>
          <p className="muted">
            Paste a Firebase registration token to exercise the backend device
            token endpoints.
          </p>
          <label className="form">
            Web token
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
              Register
            </button>
            <button
              className="button button-secondary"
              type="button"
              disabled={!deviceToken}
              onClick={onRevokeDeviceToken}
            >
              Revoke
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
