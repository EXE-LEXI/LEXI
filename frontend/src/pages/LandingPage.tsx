import React, { useState } from "react";
import { Sparkles, ArrowRight, Gamepad2, Hourglass, Award, Flame } from "lucide-react";
import { LegalDisclaimer } from "../components/layout/LegalDisclaimer";
import type { AuthResponse } from "../types/auth";

type LandingPageProps = {
  onNavigate: (path: string) => void;
  session?: AuthResponse | null;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, session }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  function handleStart() {
    if (session) {
      onNavigate("/modules");
    } else {
      onNavigate("/register");
    }
  }

  function handleGoReview() {
    onNavigate("/review");
  }

  function handleCheckAnswer() {
    if (selectedOption) {
      setShowResult(true);
    }
  }

  function handleResetQuiz() {
    setSelectedOption(null);
    setShowResult(false);
  }

  return (
    <div className="lexi-landing-root">
      
      {/* 1. Header Section */}
      {!session && (
        <header className="lexi-landing-header">
          <div className="lexi-landing-header-container">
            <div className="lexi-landing-logo">
              <span>LEXI</span>
            </div>
            
            <nav className="lexi-landing-nav">
              <a href="#lessons" onClick={(e) => e.preventDefault()}>BÀI HỌC</a>
              <a href="#library" onClick={(e) => e.preventDefault()}>THƯ VIỆN</a>
              <a href="#leaderboard" onClick={(e) => e.preventDefault()}>BẢNG XẾP HẠNG</a>
              <a href="#about" onClick={(e) => e.preventDefault()}>GIỚI THIỆU</a>
            </nav>
            
            <button className="lexi-landing-btn-start" onClick={handleStart}>
              Bắt đầu
            </button>
          </div>
        </header>
      )}

      {!session && <LegalDisclaimer />}

      {/* 2. Hero Section */}
      <section className="lexi-landing-hero">
        <div className="lexi-landing-hero-container">
          <div className="lexi-landing-hero-content">
            <div className="lexi-landing-hero-badge">
              <Sparkles size={14} />
              <span>{session ? `Chào mừng trở lại, ${session.user.profile?.fullName || session.user.email}!` : "Khai Phóng Vẻ Đẹp Di Sản"}</span>
            </div>
            
            <h1 className="lexi-landing-hero-title">
              {session ? (
                <>
                  Khám phá lộ trình<br />
                  học luật của <span className="lexi-highlight-green">Lexi</span>
                </>
              ) : (
                <>
                  Nâng tầm hiểu biết<br />
                  pháp luật cùng <span className="lexi-highlight-green">Lexi</span>
                </>
              )}
            </h1>
            
            <p className="lexi-landing-hero-subtitle">
              Làm chủ kiến thức pháp luật qua các bài học nhỏ gọn, được trò chơi hóa. Nhận phần thưởng, xây dựng chuỗi ngày học, và tự tin với kiến thức pháp lý thực tế chỉ với 5 phút mỗi ngày.
            </p>
            
            <div className="lexi-landing-hero-actions">
              <button className="lexi-btn-primary-green" onClick={handleStart}>
                {session ? "Vào học ngay" : "Bắt đầu vượt ải"}
              </button>
              <button className="lexi-btn-outline-green" onClick={session ? handleGoReview : handleStart}>
                {session ? "Radar ôn tập" : "Xem chương trình học"}
              </button>
            </div>
          </div>
          
          <div className="lexi-landing-hero-visual">
            <div className="lexi-mockup-container">
              <img 
                src="/lexi_hero_mockup.png" 
                alt="Lexi gamified phone interface mockup"
                className="lexi-mockup-img" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section: "Tại sao chọn Lexi?" */}
      <section className="lexi-landing-section bg-white-pure">
        <div className="lexi-landing-container-center">
          <h2 className="lexi-landing-section-title">Tại sao chọn Lexi?</h2>
          <p className="lexi-landing-section-subtitle">Pháp luật không nhất thiết phải nhàm chán.</p>
          
          <div className="lexi-landing-features-grid">
            {/* Feature 1 */}
            <div className="lexi-landing-feature-card">
              <div className="lexi-feature-icon-circle bg-blue-trans">
                <Gamepad2 size={22} className="text-blue-icon" />
              </div>
              <h3>Tình huống thú vị</h3>
              <p>Học qua các tình huống đời thực tế, thường xuyên hỏi đáp, giúp bạn ghi nhớ lâu hơn.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="lexi-landing-feature-card">
              <div className="lexi-feature-icon-circle bg-green-trans">
                <Hourglass size={22} className="text-green-icon" />
              </div>
              <h3>Bài học 30 giây</h3>
              <p>Các bài học ngắn gọn, nhanh chóng thiết kế cho lịch trình bận rộn. Học ngay cả khi đang xếp hàng chờ.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="lexi-landing-feature-card">
              <div className="lexi-feature-icon-circle bg-gold-trans">
                <Award size={22} className="text-gold-icon" />
              </div>
              <h3>Nhận thưởng hấp dẫn</h3>
              <p>Thu thập xu, mở khóa thành tựu và nâng xếp hạng của bạn trong quá trình học tập.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Streak Section: "Sự kiên trì là chìa khóa" */}
      <section className="lexi-landing-section bg-stone-light">
        <div className="lexi-landing-streak-container">
          {/* Left Streak Card */}
          <div className="lexi-streak-card">
            <div className="lexi-streak-flame">
              <Flame size={44} className="fill-gold stroke-gold text-amber-500 animate-bounce" />
            </div>
            <span className="lexi-streak-number">5 Ngày</span>
            <span className="lexi-streak-desc">Duy trì chuỗi ngày học của bạn</span>
          </div>
          
          {/* Right Streak Content */}
          <div className="lexi-streak-content">
            <h2 className="lexi-streak-title">Sự kiên trì là chìa khóa</h2>
            <p className="lexi-streak-subtitle">
              Người dùng của chúng tôi xây dựng những thói quen không thể phá vỡ. Tham gia cùng hàng ngàn người đang làm chủ quyền lợi của họ mỗi ngày.
            </p>
            
            <div className="lexi-streak-xu-badge">
              <span className="lexi-xu-coin">🪙</span>
              <span>Nhận Xu Cho Mỗi Bài Học</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Quiz Section: "Thử ngay" */}
      <section className="lexi-landing-section bg-white-pure">
        <div className="lexi-landing-container-center">
          <h2 className="lexi-landing-section-title">Thử ngay</h2>
          
          <div className="lexi-interactive-quiz-card">
            {/* Quiz Header */}
            <div className="lexi-quiz-header">
              <span className="lexi-quiz-category">LỚP HỢP ĐỒNG</span>
              <span className="lexi-quiz-hearts">❤️ 5</span>
            </div>
            
            {/* Quiz Title */}
            <h3 className="lexi-quiz-question">
              Nếu bạn ký một hợp đồng mà không đọc, nó có ràng buộc pháp lý không?
            </h3>
            
            {/* Quiz Options */}
            <div className="lexi-quiz-options-list">
              {/* Option A */}
              <button 
                className={`lexi-quiz-option-btn ${selectedOption === "A" ? "selected" : ""}`}
                onClick={() => !showResult && setSelectedOption("A")}
                disabled={showResult}
              >
                <span className="lexi-option-indicator">A</span>
                <span className="lexi-option-text">Không, bạn phải đọc nó trước.</span>
              </button>
              
              {/* Option B */}
              <button 
                className={`lexi-quiz-option-btn ${selectedOption === "B" ? "selected" : ""} ${showResult && selectedOption === "B" ? "correct" : ""}`}
                onClick={() => !showResult && setSelectedOption("B")}
                disabled={showResult}
              >
                <span className="lexi-option-indicator">B</span>
                <span className="lexi-option-text">Có, sự thiếu hiểu biết không phải là một lời bào chữa.</span>
              </button>
              
              {/* Option C */}
              <button 
                className={`lexi-quiz-option-btn ${selectedOption === "C" ? "selected" : ""}`}
                onClick={() => !showResult && setSelectedOption("C")}
                disabled={showResult}
              >
                <span className="lexi-option-indicator">C</span>
                <span className="lexi-option-text">Chỉ khi có luật sư chứng kiến.</span>
              </button>
            </div>
            
            {/* Quiz Feedback Results */}
            {showResult && (
              <div className={`lexi-quiz-feedback-box ${selectedOption === "B" ? "success" : "failed"}`}>
                {selectedOption === "B" ? (
                  <>
                    <strong style={{ display: "block", marginBottom: "4px" }}>🎉 Chính xác!</strong>
                    <span>Trong pháp luật, nguyên tắc <em>"Không biết luật không được miễn trừ trách nhiệm" (Ignorantia juris non excusat)</em> được áp dụng để bảo vệ tính thượng tôn pháp luật. Khi bạn ký hợp đồng, bạn được mặc định là đã đồng ý với tất cả điều khoản ràng buộc.</span>
                  </>
                ) : (
                  <>
                    <strong style={{ display: "block", marginBottom: "4px" }}>❌ Chưa chính xác!</strong>
                    <span>Đáp án đúng là <strong>B. Có, sự thiếu hiểu biết không phải là một lời bào chữa</strong>. Khi bạn ký tên vào hợp đồng, bạn đã thiết lập cam kết pháp lý ràng buộc cho dù bạn có chủ động đọc văn bản đó hay không.</span>
                  </>
                )}
                
                <button className="lexi-quiz-btn-reset" onClick={handleResetQuiz}>
                  Thử lại câu hỏi
                </button>
              </div>
            )}
            
            {/* Submit Button */}
            {!showResult && (
              <button 
                className="lexi-quiz-btn-submit" 
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
              >
                Kiểm tra đáp án
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 6. Ready Section: "Bạn đã sẵn sàng?" */}
      <section className="lexi-landing-ready-section">
        <div className="lexi-landing-container-center">
          <h2 className="lexi-ready-title">Bạn đã sẵn sàng?</h2>
          <p className="lexi-ready-subtitle">
            Tham gia LEXI ngay hôm nay và bắt đầu nâng tầm kiến thức pháp lý của bạn miễn phí. Làm chủ luật pháp, thông thái.
          </p>
          <button className="lexi-ready-btn-action" onClick={handleStart}>
            {session ? "Khóa học của tôi" : "Đăng Ký Ngay"}
          </button>
        </div>
      </section>

      {/* 7. Footer Section */}
      <footer className="lexi-landing-footer">
        <div className="lexi-landing-footer-container">
          <div className="lexi-footer-logo-block">
            <span className="lexi-footer-logo">LEXI</span>
            <span className="lexi-footer-copy">
              © 2026 LEXI Legal Resources. Luật của mọi nhà. Thông thái.
            </span>
          </div>
          
          <div className="lexi-footer-links">
            <a href="#terms" onClick={(e) => e.preventDefault()}>Điều khoản dịch vụ</a>
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Chính sách bảo mật</a>
            <a href="#curriculum" onClick={(e) => e.preventDefault()}>Chương trình học</a>
            <a href="#contact" onClick={(e) => e.preventDefault()}>Liên hệ</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
export default LandingPage;
