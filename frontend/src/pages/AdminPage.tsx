import type { FormEvent, ReactNode } from "react";
import { DownloadCloud, RefreshCcw, Sparkles } from "lucide-react";
import type {
  AdminCrawlResponse,
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
  crawlResult: AdminCrawlResponse | null;
  onCrawlLegalSources: (payload: {
    urls: string[];
    moduleId?: string | null;
    generateDrafts?: boolean;
    questionCount?: number;
  }) => Promise<void>;
  onProcessLegalSources: (payload: {
    moduleId?: string | null;
    limit?: number;
    questionCount?: number;
  }) => Promise<void>;
};

export function AdminPage({
  lessons,
  sources,
  drafts,
  mediaAssets,
  deliveryLogs,
  isLoading,
  error,
  crawlResult,
  onCrawlLegalSources,
  onProcessLegalSources,
}: AdminPageProps) {
  return (
    <main className="page">
      <p className="eyebrow">Admin Forge</p>
      <h1>Dieu hanh noi dung</h1>
      {isLoading ? <p className="notice">Loading admin console...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="admin-action-grid">
        <ActionCard
          title="Cao va tao draft"
          description="Nhap cac URL van ban phap luat, he thong se luu nguon vao MongoDB va tao lesson draft bang AI."
        >
          <AdminCrawlForm onSubmit={onCrawlLegalSources} isLoading={isLoading} />
        </ActionCard>

        <ActionCard
          title="Xu ly nguon da crawl"
          description="Lay tat ca legal source da crawl ma chua co draft va tao ban nhap AI moi."
        >
          <AdminProcessForm onSubmit={onProcessLegalSources} isLoading={isLoading} />
        </ActionCard>
      </section>

      {crawlResult ? (
        <>
          <section className="admin-result-strip">
            <div>
              <strong>{crawlResult.sources.length}</strong>
              <span>Sources</span>
            </div>
            <div>
              <strong>{crawlResult.drafts.length}</strong>
              <span>Drafts</span>
            </div>
            <div>
              <strong>{crawlResult.errors.length}</strong>
              <span>Errors</span>
            </div>
          </section>
          {crawlResult.errors.length ? (
            <section className="panel admin-error-panel">
              <h2>Crawl errors</h2>
              <ul className="plain-list admin-list">
                {crawlResult.errors.map((item) => (
                  <li key={item.url}>
                    <strong>{item.url}</strong>
                    <span>{item.message}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

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

function AdminCrawlForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (payload: {
    urls: string[];
    moduleId?: string | null;
    generateDrafts?: boolean;
    questionCount?: number;
  }) => Promise<void>;
  isLoading: boolean;
}) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const urls = String(formData.get("urls") ?? "")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    await onSubmit({
      urls,
      moduleId: String(formData.get("moduleId") ?? "").trim() || undefined,
      generateDrafts: formData.get("generateDrafts") === "on",
      questionCount: Number.parseInt(String(formData.get("questionCount") ?? "3"), 10),
    });
    event.currentTarget.reset();
  }

  return (
    <form className="admin-action-form" onSubmit={handleSubmit}>
      <label>
        URLs
        <textarea
          name="urls"
          rows={5}
          placeholder={"https://...\\nhttps://..."}
          required
          disabled={isLoading}
        />
      </label>
      <div className="admin-form-row">
        <label>
          Module ID
          <input name="moduleId" placeholder="module-1" disabled={isLoading} />
        </label>
        <label>
          Question count
          <input
            name="questionCount"
            type="number"
            min={1}
            max={10}
            defaultValue={3}
            disabled={isLoading}
          />
        </label>
      </div>
      <label className="admin-check">
        <input
          name="generateDrafts"
          type="checkbox"
          defaultChecked
          disabled={isLoading}
        />
        Tao draft ngay
      </label>
      <button className="button button-secondary" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner" />
            Dang tien hanh...
          </>
        ) : (
          <>
            <DownloadCloud size={16} />
            Cao noi dung
          </>
        )}
      </button>
    </form>
  );
}

function AdminProcessForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (payload: {
    moduleId?: string | null;
    limit?: number;
    questionCount?: number;
  }) => Promise<void>;
  isLoading: boolean;
}) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit({
      moduleId: String(formData.get("moduleId") ?? "").trim() || undefined,
      limit: Number.parseInt(String(formData.get("limit") ?? "20"), 10),
      questionCount: Number.parseInt(String(formData.get("questionCount") ?? "3"), 10),
    });
    event.currentTarget.reset();
  }

  return (
    <form className="admin-action-form" onSubmit={handleSubmit}>
      <div className="admin-form-row">
        <label>
          Module ID
          <input name="moduleId" placeholder="module-1" disabled={isLoading} />
        </label>
        <label>
          Limit
          <input
            name="limit"
            type="number"
            min={1}
            max={50}
            defaultValue={20}
            disabled={isLoading}
          />
        </label>
      </div>
      <label>
        Question count
        <input
          name="questionCount"
          type="number"
          min={1}
          max={10}
          defaultValue={3}
          disabled={isLoading}
        />
      </label>
      <button className="button button-primary" type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner" />
            Dang xu ly...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Xu ly AI
          </>
        )}
      </button>
    </form>
  );
}

function ActionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="panel admin-action-panel">
      <h2>
        <RefreshCcw size={16} />
        {title}
      </h2>
      <p className="admin-action-description">{description}</p>
      {children}
    </article>
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
