import React, { useEffect, useMemo, useState } from "react";
import { Coins, Gift, History, RefreshCw, Trophy } from "lucide-react";
import {
  getRewardAccount,
  getRewardLedger,
  getRewardRules,
  getVoucherCampaigns,
  redeemVoucher,
  type RewardAccount,
  type RewardLedgerEntry,
  type RewardRule,
  type RewardSource,
  type VoucherCampaign,
} from "../api/rewards";

type RewardsPageProps = {
  token: string;
};

const sourceLabels: Record<RewardSource, string> = {
  QUIZ: "Bài tập trắc nghiệm (Quiz)",
  GAME: "Đấu trường Game",
  DAILY_CHALLENGE: "Thử thách ngày",
  ADMIN: "Điều chỉnh từ quản trị viên",
  REDEMPTION: "Đổi voucher",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RewardsPage({ token }: RewardsPageProps) {
  const [account, setAccount] = useState<RewardAccount | null>(null);
  const [ledger, setLedger] = useState<RewardLedgerEntry[]>([]);
  const [rules, setRules] = useState<RewardRule[]>([]);
  const [vouchers, setVouchers] = useState<VoucherCampaign[]>([]);
  const [sourceFilter, setSourceFilter] = useState<RewardSource | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadRewards() {
    setIsLoading(true);
    setError(null);
    try {
      const [nextAccount, nextLedger, nextRules, nextVouchers] = await Promise.all([
        getRewardAccount(token),
        getRewardLedger(token, { page: 1, limit: 20, source: sourceFilter }),
        getRewardRules(token),
        getVoucherCampaigns(token),
      ]);
      setAccount(nextAccount);
      setLedger(nextLedger.items);
      setRules(nextRules);
      setVouchers(nextVouchers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải ví điểm thưởng.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRewards();
  }, [sourceFilter, token]);

  const earningRules = useMemo(
    () => rules.filter((rule) => rule.source !== "REDEMPTION"),
    [rules]
  );

  async function handleRedeemVoucher(campaign: VoucherCampaign) {
    setRedeemingId(campaign.id);
    setError(null);
    setNotice(null);
    try {
      const redemption = await redeemVoucher(token, campaign.id);
      setAccount((current) =>
        current
          ? {
              ...current,
              balance: redemption.coinBalance,
              lifetimeSpent: current.lifetimeSpent + redemption.costCoins,
            }
          : current
      );
      setNotice("Đã ghi nhận yêu cầu đổi voucher. Quản trị viên sẽ cấp mã voucher khi có hàng thật.");
      const nextLedger = await getRewardLedger(token, {
        page: 1,
        limit: 20,
        source: sourceFilter,
      });
      setLedger(nextLedger.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi voucher.");
    } finally {
      setRedeemingId(null);
    }
  }

  return (
    <main className="page rewards-page">
      <section className="rewards-hero">
        <div>
          <p className="eyebrow">LEXI Rewards</p>
          <h1>Tích điểm học tập, sẵn sàng đổi voucher</h1>
          <p className="muted">
            Điểm thưởng được ghi nhận khi hoàn thành bài tập trắc nghiệm (quiz) và chơi game. Các voucher chưa mở đổi chính thức trong phiên bản thử nghiệm (Beta), nhưng số dư của bạn đã được ghi nhận đầy đủ trên hệ thống backend.
          </p>
        </div>
        <div className="reward-balance-card">
          <Coins size={32} />
          <span>Số dư hiện tại</span>
          <strong>{formatNumber(account?.balance ?? 0)} LC</strong>
        </div>
      </section>

      {error && <p className="form-error">{error}</p>}
      {notice && <div className="lexi-inline-notice">{notice}</div>}

      <section className="rewards-stats-grid">
        <article className="panel reward-stat-card">
          <Trophy size={20} />
          <span>Tổng đã tích lũy</span>
          <strong>{formatNumber(account?.lifetimeEarned ?? 0)} LC</strong>
        </article>
        <article className="panel reward-stat-card">
          <Gift size={20} />
          <span>Đã sử dụng</span>
          <strong>{formatNumber(account?.lifetimeSpent ?? 0)} LC</strong>
        </article>
        <article className="panel reward-stat-card">
          <History size={20} />
          <span>Giao dịch gần đây</span>
          <strong>{formatNumber(ledger.length)}</strong>
        </article>
      </section>

      <section className="rewards-grid">
        <article className="panel rewards-ledger-panel">
          <div className="panel-heading-row">
            <div>
              <h2>Lịch sử nhận điểm</h2>
              <p className="muted">Mỗi lần cộng/trừ điểm thưởng đều được ghi nhận minh bạch.</p>
            </div>
            <div className="rewards-actions">
              <select
                value={sourceFilter}
                onChange={(event) => setSourceFilter(event.target.value as RewardSource | "all")}
                className="lexi-cms-form-select"
              >
                <option value="all">Tất cả nguồn điểm</option>
                {Object.entries(sourceLabels).map(([source, label]) => (
                  <option value={source} key={source}>{label}</option>
                ))}
              </select>
              <button className="icon-btn" type="button" onClick={loadRewards} disabled={isLoading} title="Làm mới">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="reward-ledger-list">
            {ledger.map((entry) => (
              <div className="reward-ledger-row" key={entry.id}>
                <div>
                  <strong>{sourceLabels[entry.source]}</strong>
                  <span>{formatDate(entry.createdAt)}</span>
                </div>
                <div className="reward-ledger-amount">
                  <strong className={entry.amount >= 0 ? "positive" : "negative"}>
                    {entry.amount >= 0 ? "+" : ""}{formatNumber(entry.amount)} LC
                  </strong>
                  <span>Số dư sau GD: {formatNumber(entry.balanceAfter)} LC</span>
                </div>
              </div>
            ))}

            {!isLoading && ledger.length === 0 && (
              <p className="muted empty-state">Chưa có giao dịch điểm nào.</p>
            )}
            {isLoading && ledger.length === 0 && (
              <p className="muted empty-state">Đang tải lịch sử điểm...</p>
            )}
          </div>
        </article>

        <aside className="panel rewards-voucher-panel">
          <Gift size={30} />
          <h2>Đổi quà tặng Voucher</h2>
          {vouchers.length === 0 ? (
            <>
              <p className="muted">
                Khu vực đổi voucher quà tặng thực tế sẽ được mở sau khi kết nối với các đối tác thương hiệu. Hiện tại bạn có thể tập trung tích lũy điểm thưởng trước.
              </p>
              <button className="btn-upgrade-pro" type="button" disabled>
                Chưa mở đổi voucher
              </button>
            </>
          ) : (
            <div className="reward-voucher-list">
              {vouchers.map((voucher) => {
                const canRedeem =
                  voucher.isRedeemable &&
                  (account?.balance ?? 0) >= voucher.costCoins &&
                  redeemingId !== voucher.id;

                return (
                  <div className="reward-voucher-card" key={voucher.id}>
                    <div>
                      <strong>{voucher.title}</strong>
                      <span>{voucher.description || "Voucher đổi thưởng LEXI"}</span>
                    </div>
                    <div className="reward-voucher-card-footer">
                      <strong>{formatNumber(voucher.costCoins)} LC</strong>
                      <button
                        className="btn-upgrade-pro"
                        type="button"
                        disabled={!canRedeem}
                        onClick={() => void handleRedeemVoucher(voucher)}
                      >
                        {redeemingId === voucher.id ? "Đang đổi..." : "Đổi voucher"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="reward-rules-box">
            <h3>Cách tích lũy điểm thưởng</h3>
            {earningRules.map((rule) => (
              <div className="reward-rule-row" key={rule.code}>
                <span>{rule.title}</span>
                <strong>+{formatNumber(rule.points)} LC</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

export default RewardsPage;
