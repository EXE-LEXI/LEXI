import React, { useEffect, useMemo, useState } from "react";
import { Gift, Plus, RefreshCw, TicketCheck } from "lucide-react";
import {
  createAdminVoucherCampaign,
  getAdminVoucherCampaigns,
  getAdminVoucherRedemptions,
  updateAdminVoucherCampaign,
  updateAdminVoucherRedemption,
  type AdminVoucherCampaign,
  type AdminVoucherCampaignStatus,
  type AdminVoucherRedemption,
  type AdminVoucherRedemptionStatus,
} from "../../api/admin";

type VouchersTabProps = {
  token: string;
};

const campaignStatuses: AdminVoucherCampaignStatus[] = ["DRAFT", "ACTIVE", "PAUSED", "ENDED"];
const redemptionStatuses: AdminVoucherRedemptionStatus[] = ["PENDING", "FULFILLED", "CANCELLED"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

export function VouchersTab({ token }: VouchersTabProps) {
  const [campaigns, setCampaigns] = useState<AdminVoucherCampaign[]>([]);
  const [redemptions, setRedemptions] = useState<AdminVoucherRedemption[]>([]);
  const [redemptionStatus, setRedemptionStatus] = useState<AdminVoucherRedemptionStatus | "all">("PENDING");
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [costCoins, setCostCoins] = useState(500);
  const [stock, setStock] = useState<number | "">("");
  const [status, setStatus] = useState<AdminVoucherCampaignStatus>("DRAFT");
  const [fulfillCodeById, setFulfillCodeById] = useState<Record<string, string>>({});

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [nextCampaigns, nextRedemptions] = await Promise.all([
        getAdminVoucherCampaigns(token),
        getAdminVoucherRedemptions(token, {
          page: 1,
          limit: 20,
          status: redemptionStatus,
        }),
      ]);
      setCampaigns(nextCampaigns);
      setRedemptions(nextRedemptions.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải voucher quản trị.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [redemptionStatus, token]);

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "ACTIVE").length,
    [campaigns]
  );
  const pendingRedemptions = useMemo(
    () => redemptions.filter((redemption) => redemption.status === "PENDING").length,
    [redemptions]
  );

  async function handleCreateCampaign(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    try {
      const created = await createAdminVoucherCampaign(token, {
        title: title.trim(),
        description: description.trim() || null,
        costCoins,
        stock: stock === "" ? null : stock,
        status,
      });
      setCampaigns((items) => [created, ...items]);
      setTitle("");
      setDescription("");
      setCostCoins(500);
      setStock("");
      setStatus("DRAFT");
      setNotice("Đã tạo chiến dịch voucher.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo chiến dịch voucher.");
    }
  }

  async function handleCampaignStatus(campaign: AdminVoucherCampaign, nextStatus: AdminVoucherCampaignStatus) {
    setError(null);
    setNotice(null);
    try {
      const updated = await updateAdminVoucherCampaign(token, campaign.id, {
        status: nextStatus,
      });
      setCampaigns((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      const statusText = nextStatus === "ACTIVE" ? "Hoạt động" : nextStatus === "PAUSED" ? "Tạm dừng" : nextStatus === "ENDED" ? "Kết thúc" : "Bản nháp";
      setNotice(`Đã chuyển chiến dịch sang trạng thái ${statusText}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật chiến dịch.");
    }
  }

  async function handleFulfillRedemption(redemption: AdminVoucherRedemption) {
    const code = fulfillCodeById[redemption.id]?.trim();
    if (!code) {
      setError("Cần nhập mã voucher trước khi xử lý.");
      return;
    }

    setError(null);
    setNotice(null);
    try {
      const updated = await updateAdminVoucherRedemption(token, redemption.id, {
        status: "FULFILLED",
        code,
        note: "Voucher code assigned by admin.",
      });
      setRedemptions((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setFulfillCodeById((current) => ({ ...current, [redemption.id]: "" }));
      setNotice("Đã cấp mã voucher thành công.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xử lý yêu cầu đổi voucher.");
    }
  }

  async function handleCancelRedemption(redemption: AdminVoucherRedemption) {
    setError(null);
    setNotice(null);
    try {
      const updated = await updateAdminVoucherRedemption(token, redemption.id, {
        status: "CANCELLED",
        note: "Cancelled by admin.",
      });
      setRedemptions((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setNotice("Đã hủy yêu cầu đổi voucher.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể hủy yêu cầu đổi voucher.");
    }
  }

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      <div className="lexi-cms-questions-header-row">
        <div>
          <h1 className="lexi-cms-questions-title">Quản lý Voucher</h1>
          <p className="lexi-cms-questions-desc">Tạo chiến dịch phát hành voucher và xử lý các yêu cầu đổi quà của học viên bằng đồng xu Legal Coins.</p>
        </div>
        <button className="lexi-cms-btn-filter-action" type="button" onClick={loadData} disabled={isLoading}>
          <RefreshCw size={14} />
          <span>Làm mới</span>
        </button>
      </div>

      {notice && <div className="lexi-inline-notice">{notice}</div>}
      {error && <p className="form-error">{error}</p>}

      <div className="lexi-cms-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "24px" }}>
        <div className="lexi-cms-stat-card" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title">CHIẾN DỊCH VOUCHER</span>
            <strong className="lexi-cms-stat-value">{formatNumber(campaigns.length)}</strong>
          </div>
          <div className="lexi-cms-stat-icon-wrapper"><Gift size={18} /></div>
        </div>
        <div className="lexi-cms-stat-card" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ color: "#15803d" }}>ĐANG HOẠT ĐỘNG</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#166534" }}>{formatNumber(activeCampaigns)}</strong>
          </div>
          <div className="lexi-cms-stat-icon-wrapper" style={{ color: "#15803d", background: "#dcfce7" }}><TicketCheck size={18} /></div>
        </div>
        <div className="lexi-cms-stat-card" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <div className="lexi-cms-stat-info">
            <span className="lexi-cms-stat-title" style={{ color: "#b45309" }}>ĐANG CHỜ DUYỆT</span>
            <strong className="lexi-cms-stat-value" style={{ color: "#92400e" }}>{formatNumber(pendingRedemptions)}</strong>
          </div>
          <div className="lexi-cms-stat-icon-wrapper" style={{ color: "#b45309", background: "#fef3c7" }}><Gift size={18} /></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px minmax(0, 1fr)", gap: "20px", alignItems: "start" }}>
        <form className="lexi-cms-panel-card" style={{ margin: 0 }} onSubmit={handleCreateCampaign}>
          <div className="lexi-cms-panel-header">
            <h2>Tạo chiến dịch</h2>
          </div>
          <div className="lexi-cms-form-group">
            <label>Tên voucher</label>
            <input className="lexi-cms-form-input" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </div>
          <div className="lexi-cms-form-group">
            <label>Mô tả</label>
            <textarea className="lexi-cms-form-textarea" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
          </div>
          <div className="lexi-cms-form-group">
            <label>Giá trị đổi (LC)</label>
            <input className="lexi-cms-form-input" type="number" min={1} value={costCoins} onChange={(event) => setCostCoins(Number(event.target.value))} required />
          </div>
          <div className="lexi-cms-form-group">
            <label>Số lượng (Stock)</label>
            <input className="lexi-cms-form-input" type="number" min={0} placeholder="Bỏ trống = Không giới hạn" value={stock} onChange={(event) => setStock(event.target.value === "" ? "" : Number(event.target.value))} />
          </div>
          <div className="lexi-cms-form-group">
            <label>Trạng thái</label>
            <select className="lexi-cms-form-select" value={status} onChange={(event) => setStatus(event.target.value as AdminVoucherCampaignStatus)}>
              {campaignStatuses.map((item) => <option key={item} value={item}>{item === "ACTIVE" ? "Hoạt động" : item === "PAUSED" ? "Tạm dừng" : item === "ENDED" ? "Kết thúc" : "Bản nháp"}</option>)}
            </select>
          </div>
          <button className="lexi-cms-btn-save" type="submit">
            <Plus size={14} /> Tạo chiến dịch
          </button>
        </form>

        <div style={{ display: "grid", gap: "20px" }}>
          <section className="lexi-cms-panel-card" style={{ margin: 0 }}>
            <div className="lexi-cms-panel-header">
              <h2>Chiến dịch hoạt động</h2>
            </div>
            <div className="lexi-cms-table-wrapper">
              <table className="lexi-cms-table">
                <thead>
                  <tr>
                    <th>Voucher quà tặng</th>
                    <th>Giá đổi</th>
                    <th>Số lượng</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <strong>{campaign.title}</strong>
                        <span style={{ display: "block", color: "#64748b", fontSize: "12px" }}>{campaign.description || "Voucher đổi thưởng LEXI"}</span>
                      </td>
                      <td>{formatNumber(campaign.costCoins)} LC</td>
                      <td>{campaign.stock ?? "Không giới hạn"}</td>
                      <td>
                        <select className="lexi-cms-form-select" value={campaign.status} onChange={(event) => void handleCampaignStatus(campaign, event.target.value as AdminVoucherCampaignStatus)}>
                          {campaignStatuses.map((item) => <option key={item} value={item}>{item === "ACTIVE" ? "Hoạt động" : item === "PAUSED" ? "Tạm dừng" : item === "ENDED" ? "Kết thúc" : "Bản nháp"}</option>)}
                        </select>
                      </td>
                      <td>{formatDate(campaign.createdAt)}</td>
                    </tr>
                  ))}
                  {!campaigns.length && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>Chưa có chiến dịch nào được tạo.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="lexi-cms-panel-card" style={{ margin: 0 }}>
            <div className="lexi-cms-panel-header">
              <h2>Yêu cầu đổi voucher</h2>
              <select className="lexi-cms-form-select" value={redemptionStatus} onChange={(event) => setRedemptionStatus(event.target.value as AdminVoucherRedemptionStatus | "all")}>
                <option value="all">Tất cả</option>
                {redemptionStatuses.map((item) => <option key={item} value={item}>{item === "PENDING" ? "Đang chờ duyệt" : item === "FULFILLED" ? "Đã duyệt" : "Đã hủy"}</option>)}
              </select>
            </div>
            <div className="lexi-cms-table-wrapper">
              <table className="lexi-cms-table">
                <thead>
                  <tr>
                    <th>Học viên</th>
                    <th>Quà tặng</th>
                    <th>Giá trị</th>
                    <th>Trạng thái</th>
                    <th>Duyệt & Cấp mã</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((redemption) => (
                    <tr key={redemption.id}>
                      <td>
                        <strong>{redemption.user.fullName || redemption.user.email}</strong>
                        <span style={{ display: "block", color: "#64748b", fontSize: "12px" }}>{redemption.user.email}</span>
                      </td>
                      <td>{redemption.campaign.title}</td>
                      <td>{formatNumber(redemption.costCoins)} LC</td>
                      <td>{redemption.status === "PENDING" ? "Chờ duyệt" : redemption.status === "FULFILLED" ? "Đã duyệt" : "Đã hủy"}</td>
                      <td>
                        {redemption.status === "PENDING" ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input className="lexi-cms-form-input" placeholder="Nhập mã voucher" value={fulfillCodeById[redemption.id] || ""} onChange={(event) => setFulfillCodeById((current) => ({ ...current, [redemption.id]: event.target.value }))} />
                            <button className="lexi-cms-btn-save" type="button" onClick={() => void handleFulfillRedemption(redemption)}>Duyệt</button>
                            <button className="lexi-cms-btn-cancel" type="button" onClick={() => void handleCancelRedemption(redemption)}>Hủy</button>
                          </div>
                        ) : (
                          <span>{redemption.code || redemption.note || "-"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!redemptions.length && (
                    <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>Không có yêu cầu đổi voucher nào phù hợp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
