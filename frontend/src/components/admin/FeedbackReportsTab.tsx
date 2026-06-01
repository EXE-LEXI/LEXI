import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Inbox,
  MessageSquareWarning,
  RefreshCw,
} from "lucide-react";
import {
  getAdminFeedbackReports,
  updateAdminFeedbackReportStatus,
  type AdminFeedbackReport,
  type AdminFeedbackReportCategory,
  type AdminFeedbackReportStatus,
} from "../../api/admin";
import { formatDate } from "../../utils/format";

type FeedbackReportsTabProps = {
  token: string;
  searchQuery: string;
};

const REPORTS_PER_PAGE = 10;

const categoryLabels: Record<AdminFeedbackReportCategory, string> = {
  CONTENT_ISSUE: "Lỗi nội dung",
  LEGAL_CORRECTION: "Cần rà soát pháp lý",
  BUG: "Lỗi kỹ thuật",
  SUGGESTION: "Góp ý",
  OTHER: "Khác",
};

const statusLabels: Record<AdminFeedbackReportStatus, string> = {
  OPEN: "Mới",
  REVIEWING: "Đang xử lý",
  RESOLVED: "Đã xử lý",
  DISMISSED: "Bỏ qua",
};

const statusOptions: AdminFeedbackReportStatus[] = [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
];

const categoryOptions: AdminFeedbackReportCategory[] = [
  "CONTENT_ISSUE",
  "LEGAL_CORRECTION",
  "BUG",
  "SUGGESTION",
  "OTHER",
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getUserLabel(report: AdminFeedbackReport) {
  if (!report.user) {
    return "Khách hoặc tài khoản đã xóa";
  }

  return report.user.fullName || report.user.email;
}

function getStatusClass(status: AdminFeedbackReportStatus) {
  if (status === "RESOLVED") {
    return "green";
  }
  if (status === "DISMISSED") {
    return "medium";
  }
  return status === "REVIEWING" ? "blue" : "purple";
}

export function FeedbackReportsTab({ token, searchQuery }: FeedbackReportsTabProps) {
  const [reports, setReports] = useState<AdminFeedbackReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AdminFeedbackReportStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AdminFeedbackReportCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAdminFeedbackReports(token, {
          page,
          limit: REPORTS_PER_PAGE,
          search: searchQuery,
          status: statusFilter,
          category: categoryFilter,
        });

        if (cancelled) {
          return;
        }

        setReports(response.items);
        setTotal(response.meta.total);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không tải được danh sách feedback.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadReports, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [categoryFilter, page, searchQuery, statusFilter, token]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / REPORTS_PER_PAGE)), [total]);
  const openCount = reports.filter((report) => report.status === "OPEN").length;
  const reviewingCount = reports.filter((report) => report.status === "REVIEWING").length;
  const resolvedCount = reports.filter((report) => report.status === "RESOLVED").length;

  async function handleStatusChange(reportId: string, status: AdminFeedbackReportStatus) {
    const currentReport = reports.find((report) => report.id === reportId);
    if (!currentReport || currentReport.status === status) {
      return;
    }

    setUpdatingId(reportId);
    setNotice(null);
    setError(null);
    try {
      const updatedReport = await updateAdminFeedbackReportStatus(token, reportId, status);
      setReports((current) =>
        current.map((report) => (report.id === reportId ? updatedReport : report))
      );
      setNotice(`Đã chuyển report sang trạng thái "${statusLabels[status]}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không cập nhật được trạng thái report.");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleRefresh() {
    setPage(1);
    setNotice("Đang làm mới danh sách report.");
    void getAdminFeedbackReports(token, {
      page: 1,
      limit: REPORTS_PER_PAGE,
      search: searchQuery,
      status: statusFilter,
      category: categoryFilter,
    })
      .then((response) => {
        setReports(response.items);
        setTotal(response.meta.total);
        setNotice("Danh sách feedback đã được làm mới.");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Không làm mới được danh sách feedback.");
      });
  }

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div className="lexi-cms-questions-header-row">
        <div>
          <h1 className="lexi-cms-questions-title">Feedback & báo cáo nội dung</h1>
          <p className="lexi-cms-questions-desc">
            Theo dõi lỗi nội dung, yêu cầu rà soát pháp lý và góp ý từ người dùng trước khi đưa sản phẩm ra beta rộng hơn.
          </p>
        </div>
        <button
          className="lexi-cms-btn-filter-action"
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          style={{ background: "#ffffff", height: "38px" }}
        >
          <RefreshCw size={14} />
          <span>Làm mới</span>
        </button>
      </div>

      {notice && <div className="lexi-inline-notice">{notice}</div>}
      {error && <p className="form-error">{error}</p>}

      <div className="lexi-cms-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "24px" }}>
        <div className="lexi-cms-stat-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ color: "#64748b" }}>REPORT TRÊN TRANG</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#1e293b" }}>{formatNumber(reports.length)}</strong>
            <span className="lexi-cms-stat-trend neutral">{formatNumber(total)} tổng report</span>
          </div>
          <div className="lexi-cms-stat-icon-wrapper" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            <Inbox size={18} />
          </div>
        </div>

        <div className="lexi-cms-stat-card" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ color: "#b45309" }}>CẦN XỬ LÝ</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#92400e" }}>{formatNumber(openCount + reviewingCount)}</strong>
            <span className="lexi-cms-stat-trend" style={{ color: "#b45309" }}>{reviewingCount} đang xử lý</span>
          </div>
          <div className="lexi-cms-stat-icon-wrapper" style={{ background: "#fef3c7", color: "#b45309" }}>
            <Clock3 size={18} />
          </div>
        </div>

        <div className="lexi-cms-stat-card" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ color: "#15803d" }}>ĐÃ XỬ LÝ</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#166534" }}>{formatNumber(resolvedCount)}</strong>
            <span className="lexi-cms-stat-trend neutral">Tính trên trang hiện tại</span>
          </div>
          <div className="lexi-cms-stat-icon-wrapper" style={{ background: "#dcfce7", color: "#15803d" }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      <div className="lexi-cms-questions-filter-card" style={{ marginBottom: "20px" }}>
        <div className="lexi-cms-questions-filter-fields">
          <div className="lexi-cms-form-group">
            <label>Trạng thái</label>
            <select
              className="lexi-cms-form-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AdminFeedbackReportStatus | "all")}
            >
              <option value="all">Tất cả trạng thái</option>
              {statusOptions.map((status) => (
                <option value={status} key={status}>{statusLabels[status]}</option>
              ))}
            </select>
          </div>

          <div className="lexi-cms-form-group">
            <label>Loại report</label>
            <select
              className="lexi-cms-form-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as AdminFeedbackReportCategory | "all")}
            >
              <option value="all">Tất cả loại report</option>
              {categoryOptions.map((category) => (
                <option value={category} key={category}>{categoryLabels[category]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="lexi-cms-panel-card" style={{ margin: 0, padding: "20px 24px" }}>
        <div className="lexi-cms-table-wrapper">
          <table className="lexi-cms-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Người gửi</th>
                <th>Trang</th>
                <th>Ngày gửi</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td style={{ minWidth: "260px", maxWidth: "360px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <MessageSquareWarning size={17} style={{ color: "#4f46e5", marginTop: "2px", flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: "#1e293b", display: "block", marginBottom: "4px" }}>{report.subject}</strong>
                        <span style={{ color: "#64748b", fontSize: "12.5px", lineHeight: 1.5 }}>
                          {report.message.length > 140 ? `${report.message.slice(0, 140)}...` : report.message}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="lexi-cms-question-row-pill blue" style={{ textTransform: "none" }}>
                      {categoryLabels[report.category]}
                    </span>
                  </td>
                  <td>
                    <span className={`lexi-cms-question-row-pill ${getStatusClass(report.status)}`} style={{ textTransform: "none" }}>
                      {statusLabels[report.status]}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "#334155", fontSize: "13px" }}>{getUserLabel(report)}</strong>
                    {report.user?.email ? (
                      <span style={{ color: "#64748b", display: "block", fontSize: "12px", marginTop: "3px" }}>
                        {report.user.email}
                      </span>
                    ) : null}
                  </td>
                  <td style={{ color: "#64748b", fontSize: "12.5px" }}>{report.pagePath || "-"}</td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td>
                    <select
                      className="lexi-cms-form-select"
                      value={report.status}
                      onChange={(event) => void handleStatusChange(report.id, event.target.value as AdminFeedbackReportStatus)}
                      disabled={updatingId === report.id}
                      aria-label={`Cập nhật trạng thái report ${report.subject}`}
                      style={{ minWidth: "140px" }}
                    >
                      {statusOptions.map((status) => (
                        <option value={status} key={status}>{statusLabels[status]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}

              {!isLoading && reports.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                    Chưa có feedback report phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}

              {isLoading && reports.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                    Đang tải feedback report...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lexi-cms-pagination" style={{ borderTop: "1px solid #f1f5f9", marginTop: "16px", paddingTop: "16px" }}>
          <span className="lexi-cms-pagination-info">
            Hiển thị {reports.length === 0 ? 0 : (page - 1) * REPORTS_PER_PAGE + 1}-{Math.min(page * REPORTS_PER_PAGE, total)} của {formatNumber(total)}
          </span>
          <div className="lexi-cms-pagination-controls">
            <button
              className="lexi-cms-btn-page"
              title="Trang trước"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button className="lexi-cms-btn-page active" type="button">{page}</button>
            <button
              className="lexi-cms-btn-page"
              title="Trang sau"
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
