import React, { useEffect, useMemo, useState } from "react";
import { Users, TrendingUp, Sliders, Download, ChevronRight } from "lucide-react";
import {
  getAdminUsers,
  getAdminUserSummary,
  type AdminUser,
  type AdminUserSummary,
} from "../../api/admin";

type UsersTabProps = {
  token: string;
  searchQuery: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    return "Vừa xong";
  }
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

function getDisplayName(user: AdminUser) {
  return user.profile?.fullName || user.email;
}

function getInitial(user: AdminUser) {
  return getDisplayName(user).trim().charAt(0).toUpperCase() || "U";
}

function exportUsersCsv(users: AdminUser[]) {
  const rows = [
    ["name", "email", "role", "status", "level", "xp", "legal_coins", "last_active"],
    ...users.map((user) => [
      getDisplayName(user),
      user.email,
      user.role,
      user.status,
      String(user.level),
      String(user.profile?.xp ?? 0),
      String(user.legalCoins),
      user.lastActiveAt,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lexi-admin-users.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function UsersTab({ token, searchQuery }: UsersTabProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<AdminUserSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setIsLoading(true);
      setError(null);
      try {
        const [nextUsers, nextSummary] = await Promise.all([
          getAdminUsers(token, { page, limit: 10, search: searchQuery }),
          getAdminUserSummary(token),
        ]);

        if (cancelled) {
          return;
        }

        setUsers(nextUsers.items);
        setTotal(nextUsers.meta.total);
        setSummary(nextSummary);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không tải được danh sách học viên");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    const timer = window.setTimeout(loadUsers, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [page, searchQuery, token]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 10)), [total]);

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div className="lexi-cms-questions-header-row">
        <div>
          <h1 className="lexi-cms-questions-title">Danh sách người dùng</h1>
          <p className="lexi-cms-questions-desc">Quản lý và theo dõi tiến độ học tập của học viên.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="lexi-cms-btn-filter-action"
            type="button"
            style={{ background: "#ffffff", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", height: "38px" }}
          >
            <Sliders size={14} />
            <span>Lọc</span>
          </button>
          <button
            className="lexi-cms-btn-create-course"
            type="button"
            onClick={() => exportUsersCsv(users)}
            style={{ background: "#4f46e5", height: "38px", padding: "0 16px" }}
          >
            <Download size={14} />
            <span style={{ marginLeft: "6px" }}>Xuất dữ liệu</span>
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="lexi-cms-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "28px" }}>
        <div className="lexi-cms-stat-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ fontSize: "10px", color: "#64748b" }}>TỔNG HỌC VIÊN</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#1e293b", fontSize: "28px" }}>
              {formatNumber(summary?.totalUsers ?? 0)}
            </strong>
          </div>
          <div className="lexi-cms-stat-icon-wrapper" style={{ width: "36px", height: "36px", background: "#e0f2fe", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
            <Users size={16} />
          </div>
        </div>

        <div className="lexi-cms-stat-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ fontSize: "10px", color: "#64748b" }}>HOẠT ĐỘNG TRONG TUẦN</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#15803d", fontSize: "28px" }}>
              {formatNumber(summary?.activeThisWeek ?? 0)}
            </strong>
          </div>
          <div className="lexi-cms-stat-icon-wrapper" style={{ width: "36px", height: "36px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#15803d" }}>
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="lexi-cms-stat-card" style={{ background: "#fffbeb", border: "1px solid #fde047" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ fontSize: "10px", color: "#b45309" }}>TỔNG LEGAL COINS</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#b45309", fontSize: "28px" }}>
              {formatNumber(summary?.totalLegalCoins ?? 0)}
            </strong>
          </div>
          <div className="lexi-cms-stat-icon-wrapper" style={{ width: "36px", height: "36px", background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
            LC
          </div>
        </div>
      </div>

      <div className="lexi-cms-panel-card" style={{ margin: 0, padding: "20px 24px" }}>
        <div className="lexi-cms-table-wrapper">
          <table className="lexi-cms-table">
            <thead>
              <tr>
                <th style={{ color: "#64748b", fontWeight: 700, fontSize: "12px", borderBottom: "1.5px solid #cbd5e1" }}>Học viên</th>
                <th style={{ color: "#64748b", fontWeight: 700, fontSize: "12px", textAlign: "center", borderBottom: "1.5px solid #cbd5e1" }}>Cấp độ</th>
                <th style={{ color: "#64748b", fontWeight: 700, fontSize: "12px", textAlign: "right", borderBottom: "1.5px solid #cbd5e1" }}>Tổng XP</th>
                <th style={{ color: "#64748b", fontWeight: 700, fontSize: "12px", textAlign: "right", borderBottom: "1.5px solid #cbd5e1" }}>Legal Coins</th>
                <th style={{ color: "#64748b", fontWeight: 700, fontSize: "12px", borderBottom: "1.5px solid #cbd5e1" }}>Hoạt động cuối</th>
                <th style={{ color: "#64748b", fontWeight: 700, fontSize: "12px", textAlign: "center", borderBottom: "1.5px solid #cbd5e1" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left" }}>
                      {user.profile?.avatarUrl ? (
                        <img
                          src={user.profile.avatarUrl}
                          alt={getDisplayName(user)}
                          style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>
                          {getInitial(user)}
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "#1e293b", fontSize: "14px", fontWeight: 700 }}>{getDisplayName(user)}</strong>
                        <span style={{ color: "#64748b", fontSize: "12px" }}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 8px", textAlign: "center" }}>
                    <span className="lexi-cms-question-row-pill purple" style={{ textTransform: "none", fontSize: "11px", padding: "3px 10px" }}>
                      Level {user.level}
                    </span>
                  </td>
                  <td style={{ padding: "16px 8px", textAlign: "right", color: "#475569", fontWeight: 600 }}>
                    {formatNumber(user.profile?.xp ?? 0)}
                  </td>
                  <td style={{ padding: "16px 8px", textAlign: "right", color: "#b45309", fontWeight: 700 }}>
                    {formatNumber(user.legalCoins)}
                  </td>
                  <td style={{ padding: "16px 8px", color: "#64748b", fontSize: "13px" }}>
                    {formatRelativeDate(user.lastActiveAt)}
                  </td>
                  <td style={{ padding: "16px 8px", textAlign: "center" }}>
                    <span className={`lexi-cms-question-row-pill ${user.status === "ACTIVE" ? "green" : "blue"}`} style={{ textTransform: "none", fontSize: "11px", padding: "3px 10px" }}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}

              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              )}

              {isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
                    Đang tải người dùng...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lexi-cms-pagination" style={{ borderTop: "1px solid #f1f5f9", marginTop: "16px", paddingTop: "16px" }}>
          <span className="lexi-cms-pagination-info" style={{ fontSize: "12.5px" }}>
            Hiển thị {users.length === 0 ? 0 : (page - 1) * 10 + 1}-{Math.min(page * 10, total)} của {formatNumber(total)}
          </span>
          <div className="lexi-cms-pagination-controls">
            <button className="lexi-cms-btn-page" title="Trang trước" type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button className="lexi-cms-btn-page active" type="button">{page}</button>
            <button className="lexi-cms-btn-page" title="Trang sau" type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
