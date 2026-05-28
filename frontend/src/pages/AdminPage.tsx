import type { ReactNode } from "react";
import type {
  AdminDeliveryLog,
  AdminDraft,
  AdminLesson,
  AdminMediaAsset,
  AdminSource,
} from "../api/admin";
import { formatDate } from "../utils/format";

type AdminPageProps = {
  lessons: AdminLesson[];
  sources: AdminSource[];
  drafts: AdminDraft[];
  mediaAssets: AdminMediaAsset[];
  deliveryLogs: AdminDeliveryLog[];
  isLoading: boolean;
  error: string | null;
};

export function AdminPage({
  lessons,
  sources,
  drafts,
  mediaAssets,
  deliveryLogs,
  isLoading,
  error,
}: AdminPageProps) {
  return (
    <main className="page">
      <p className="eyebrow">Admin Forge</p>
      <h1>Dieu hanh noi dung</h1>
      {isLoading ? <p className="notice">Loading admin console...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="admin-grid">
        <AdminPanel title="Lessons">
          {lessons.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.reviewStatus ?? (item.isActive ? "ACTIVE" : "INACTIVE")}</span>
            </li>
          ))}
        </AdminPanel>

        <AdminPanel title="Legal Sources">
          {sources.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.documentNo ?? item.crawlStatus ?? "-"}</span>
            </li>
          ))}
        </AdminPanel>

        <AdminPanel title="AI Drafts">
          {drafts.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.status ?? "-"}</span>
            </li>
          ))}
        </AdminPanel>

        <AdminPanel title="Media Assets">
          {mediaAssets.map((item) => (
            <li key={item.id}>
              <strong>{item.title ?? item.id}</strong>
              <span>{item.status ?? item.type ?? "-"}</span>
            </li>
          ))}
        </AdminPanel>

        <AdminPanel title="Notification Logs">
          {deliveryLogs.map((item) => (
            <li key={item.id}>
              <strong>{item.type ?? item.id}</strong>
              <span>
                {item.status ?? "-"} {item.createdAt ? formatDate(item.createdAt) : ""}
              </span>
            </li>
          ))}
        </AdminPanel>
      </section>
    </main>
  );
}

function AdminPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="panel">
      <h2>{title}</h2>
      <ul className="plain-list admin-list">{children}</ul>
    </article>
  );
}
