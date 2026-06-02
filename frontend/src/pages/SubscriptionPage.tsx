import React, { useState } from "react";
import { Sparkles, Check, HelpCircle, ArrowRight, ShieldCheck, Mail, Send, Award } from "lucide-react";
import type { AuthResponse } from "../types/auth";

type SubscriptionPageProps = {
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
};

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ session, onNavigate }) => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  
  // Waitlist form states
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [emailInput, setEmailInput] = useState(session?.user?.email || "");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleOpenWaitlist = (planName: string) => {
    setSelectedPlan(planName);
    setIsWaitlistOpen(true);
    setWaitlistSubmitted(false);
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setWaitlistSubmitted(true);
  };

  return (
    <div className="lexi-pricing-root lexi-animate-fade">
      <div className="lexi-pricing-container">
        
        {/* Header */}
        <header className="lexi-pricing-header">
          <div className="header-badge">
            <Sparkles size={16} />
            <span>Nâng tầm kiến thức</span>
            <span className="lexi-beta-pill">Waitlist</span>
          </div>
          <h1>Mở Khóa Toàn Diện Năng Lực Pháp Lý</h1>
          <p>Lựa chọn gói đồng hành phù hợp để tăng tốc học tập, trải nghiệm tính năng phân tích AI nâng cao và sở hữu các tài liệu biểu mẫu chuyên nghiệp.</p>
          <div className="lexi-inline-notice">
            <span>
              Cổng thanh toán chưa được kích hoạt trong bản thử nghiệm (Beta). Các lượt đăng ký 
              gói Pro và Premium chỉ nhằm ghi nhận mức độ quan tâm của người dùng và hoàn toàn không thu phí.
            </span>
          </div>
          
          {/* Billing Switcher Toggle */}
          <div className="billing-switcher">
            <button
              className={`switch-btn ${billingPeriod === "monthly" ? "active" : ""}`}
              onClick={() => setBillingPeriod("monthly")}
            >
              Thanh toán hàng tháng
            </button>
            <button
              className={`switch-btn ${billingPeriod === "yearly" ? "active" : ""}`}
              onClick={() => setBillingPeriod("yearly")}
            >
              <span>Thanh toán hàng năm</span>
              <span className="discount-badge">Tiết kiệm 20%</span>
            </button>
          </div>
        </header>

        {/* Pricing Cards Grid */}
        <div className="pricing-cards-grid">
          
          {/* Plan 1: Free */}
          <div className="pricing-card free-plan">
            <div className="card-header">
              <span className="plan-badge">HỌC TẬP</span>
              <h2>Lexi Basic</h2>
              <p className="plan-desc">Hoàn hảo cho người mới bắt đầu tìm hiểu kiến thức pháp lý phổ thông.</p>
              
              <div className="price-tag">
                <span className="amount">0đ</span>
                <span className="period">/ Vĩnh viễn</span>
              </div>
            </div>

            <div className="card-divider"></div>

            <ul className="features-list">
              <li>
                <Check size={16} className="check-icon" />
                <span>Truy cập tối đa 5 bài học cơ bản</span>
              </li>
              <li>
                <Check size={16} className="check-icon" />
                <span>Thi đấu Đấu trường 1 lần/ngày</span>
              </li>
              <li>
                <Check size={16} className="check-icon" />
                <span>Xem Video Ngắn miễn phí</span>
              </li>
              <li className="disabled">
                <Check size={16} className="check-icon" />
                <span>Không hỗ trợ phân tích AI của cố vấn</span>
              </li>
              <li className="disabled">
                <Check size={16} className="check-icon" />
                <span>Không tải được tài liệu hợp đồng</span>
              </li>
            </ul>

            <button className="pricing-cta-btn secondary" onClick={() => onNavigate("/modules")}>
              Trải nghiệm ngay
            </button>
          </div>

          {/* Plan 2: Pro (Popular) */}
          <div className="pricing-card pro-plan popular">
            <div className="popular-ribbon">
              <Sparkles size={12} />
              <span>PHỔ BIẾN NHẤT</span>
            </div>
            
            <div className="card-header">
              <span className="plan-badge gold">CHUYÊN NGHIỆP</span>
              <h2>Lexi Pro</h2>
              <p className="plan-desc">Lựa chọn tối ưu cho cá nhân và sinh viên luật muốn nâng cao năng lực toàn diện.</p>
              
              <div className="price-tag">
                <span className="amount">
                  {billingPeriod === "monthly" ? "129.000đ" : "99.000đ"}
                </span>
                <span className="period">/ Tháng</span>
              </div>
              {billingPeriod === "yearly" && (
                <span className="billing-billed-yearly">Thanh toán theo năm: 1.188.000đ</span>
              )}
            </div>

            <div className="card-divider"></div>

            <ul className="features-list">
              <li>
                <Check size={16} className="check-icon gold" />
                <span>Không giới hạn toàn bộ khóa học</span>
              </li>
              <li>
                <Check size={16} className="check-icon gold" />
                <span>Không giới hạn lượt tham gia Đấu trường</span>
              </li>
              <li>
                <Check size={16} className="check-icon gold" />
                <span>Cố vấn AI giải thích lỗi sai bài học</span>
              </li>
              <li>
                <Check size={16} className="check-icon gold" />
                <span>100 câu hỏi giải đáp tình huống thực tế</span>
              </li>
              <li className="disabled">
                <Check size={16} className="check-icon" />
                <span>Tải thư viện hợp đồng mẫu thương mại</span>
              </li>
            </ul>

            <button className="pricing-cta-btn primary" onClick={() => handleOpenWaitlist("Lexi Pro")}>
              <span>Nâng cấp Pro ngay</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Plan 3: Premium */}
          <div className="pricing-card premium-plan">
            <div className="card-header">
              <span className="plan-badge dark">DOANH NGHIỆP</span>
              <h2>Lexi Premium</h2>
              <p className="plan-desc">Phù hợp cho các doanh nghiệp, startup và chuyên gia cần bộ công cụ pháp lý nâng cao.</p>
              
              <div className="price-tag">
                <span className="amount">
                  {billingPeriod === "monthly" ? "299.000đ" : "239.000đ"}
                </span>
                <span className="period">/ Tháng</span>
              </div>
              {billingPeriod === "yearly" && (
                <span className="billing-billed-yearly">Thanh toán theo năm: 2.868.000đ</span>
              )}
            </div>

            <div className="card-divider"></div>

            <ul className="features-list">
              <li>
                <Check size={16} className="check-icon primary" />
                <span>Tất cả quyền lợi của gói Pro</span>
              </li>
              <li>
                <Check size={16} className="check-icon primary" />
                <span>Phân tích AI tình huống pháp lý độc quyền</span>
              </li>
              <li>
                <Check size={16} className="check-icon primary" />
                <span>Tải không giới hạn thư viện hợp đồng mẫu</span>
              </li>
              <li>
                <Check size={16} className="check-icon primary" />
                <span>Hỗ trợ pháp lý trực tuyến 24/7 từ cố vấn</span>
              </li>
              <li>
                <Check size={16} className="check-icon primary" />
                <span>Nhận huy hiệu Độc quyền & Chứng nhận Lexi</span>
              </li>
            </ul>

            <button className="pricing-cta-btn secondary" onClick={() => handleOpenWaitlist("Lexi Premium")}>
              Liên hệ đăng ký
            </button>
          </div>

        </div>

        {/* Feature Comparison Matrix */}
        <section className="lexi-pricing-comparison-section">
          <h2>Bảng So Sánh Quyền Lợi Chi Tiết</h2>
          <div className="table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Tính năng</th>
                  <th>Cơ bản (Basic)</th>
                  <th>Chuyên nghiệp (Pro)</th>
                  <th>Cao cấp (Premium)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Số lượng bài học mở khóa</td>
                  <td>5 bài học</td>
                  <td>Không giới hạn</td>
                  <td>Không giới hạn</td>
                </tr>
                <tr>
                  <td>Thi đấu Đấu trường rèn luyện</td>
                  <td>1 lượt/ngày</td>
                  <td>Không giới hạn</td>
                  <td>Không giới hạn</td>
                </tr>
                <tr>
                  <td>Phân tích AI lỗi sai đề thi</td>
                  <td>Không hỗ trợ</td>
                  <td>Đầy đủ chi tiết</td>
                  <td>Đầy đủ chi tiết</td>
                </tr>
                <tr>
                  <td>Thư viện hợp đồng mẫu thương mại</td>
                  <td>Không hỗ trợ</td>
                  <td>Không hỗ trợ</td>
                  <td>Tải không giới hạn</td>
                </tr>
                <tr>
                  <td>Huy hiệu đặc quyền & Chứng chỉ</td>
                  <td>Không hỗ trợ</td>
                  <td>Không hỗ trợ</td>
                  <td>Chứng nhận hoàn thành khóa học</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Waitlist Modal ( Coming Soon checkout ) */}
        {isWaitlistOpen && (
          <div className="lexi-pricing-modal-overlay lexi-animate-fade" onClick={() => setIsWaitlistOpen(false)}>
            <div className="modal-card panel-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <ShieldCheck size={36} className="shield-icon" />
                <h3>Tính Năng Đang Phát Triển</h3>
                <p>Cảm ơn bạn đã quan tâm đến gói dịch vụ <strong>{selectedPlan}</strong>!</p>
              </div>

              {!waitlistSubmitted ? (
                <form className="modal-form" onSubmit={handleWaitlistSubmit}>
                  <p>Hệ thống cổng thanh toán trực tuyến đang được tích hợp bảo mật. Vui lòng để lại email của bạn dưới đây, chúng tôi sẽ ưu đãi giảm giá 30% khi cổng thanh toán chính thức vận hành.</p>
                  
                  <div className="input-field-group">
                    <label>Địa chỉ Email nhận ưu đãi</label>
                    <div className="input-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input
                        type="email"
                        required
                        placeholder="email@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <button className="lexi-btn-action-primary" type="submit">
                    <span>Đăng ký nhận ưu đãi 30%</span>
                    <Send size={14} style={{ marginLeft: "6px" }} />
                  </button>
                </form>
              ) : (
                <div className="modal-success lexi-animate-fade">
                  <Award size={48} className="success-icon" />
                  <h4>Đăng ký thành công!</h4>
                  <p>Địa chỉ <strong>{emailInput}</strong> đã được ghi nhận vào danh sách ưu tiên đặc biệt của Lexi. Chúng tôi sẽ liên hệ trong thời gian sớm nhất!</p>
                  <button className="lexi-btn-action-primary" onClick={() => setIsWaitlistOpen(false)}>Đóng</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default SubscriptionPage;
