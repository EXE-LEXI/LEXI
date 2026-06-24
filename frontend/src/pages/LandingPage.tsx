import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Gamepad2, Hourglass, Award, Flame, Compass, History, BookOpen } from "lucide-react";
import { LegalDisclaimer } from "../components/layout/LegalDisclaimer";
import type { AuthResponse } from "../types/auth";
import { getRecommendations, getLearningHistory, getProgressSummary } from "../api/learning";
import type { ContentRecommendation } from "../types/learning";
import type { LearningHistoryItem, ProgressSummary } from "../types/progress";

type LandingPageProps = {
  onNavigate: (path: string) => void;
  session?: AuthResponse | null;
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, session }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  // Dashboard state variables (called unconditionally)
  const [recs, setRecs] = useState<ContentRecommendation[]>([]);
  const [historyList, setHistoryList] = useState<LearningHistoryItem[]>([]);
  const [summaryData, setSummaryData] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      getRecommendations(session.accessToken, 3).then(setRecs).catch(console.error);
      getLearningHistory(session.accessToken, 1, 3).then(res => setHistoryList(res.items)).catch(console.error);
      getProgressSummary(session.accessToken).then(setSummaryData).catch(console.error);
    }
  }, [session?.accessToken]);

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

  if (session) {
    const fullName = session.user.profile?.fullName || session.user.email || "Học viên";
    const streak = session.user.profile?.streak ?? 12;
    const xp = session.user.profile?.xp ?? 1200;
    const coins = Math.floor(xp / 3) ?? 400;
    const level = Math.floor(xp / 100) || 1;

    return (
      <div className="lexi-dashboard-root" style={{
        padding: "40px",
        maxWidth: "1400px",
        margin: "0 auto",
        color: "#1e293b",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
      }}>
        {/* Welcome Section */}
        <div style={{
          background: "linear-gradient(135deg, #006241, #004b32)",
          borderRadius: "20px",
          padding: "36px 40px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          boxShadow: "0 10px 30px rgba(0, 98, 65, 0.15)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <Sparkles size={18} style={{ color: "#facc15" }} />
              <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#a7f3d0" }}>Đại sảnh học tập</span>
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 900, margin: 0 }}>Chào mừng trở lại, {fullName}! 👋</h1>
            <p style={{ fontSize: "16px", color: "#d1fae5", marginTop: "8px", maxWidth: "600px", lineHeight: 1.5 }}>
              Bạn đang làm rất tốt. Hãy tiếp tục duy trì chuỗi học tập để nhận những phần thưởng độc quyền từ LEXI.
            </p>
          </div>
          {/* Stats quick view */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(8px)", padding: "16px 24px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#fbbf24" }}>🔥 {streak}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#a7f3d0", marginTop: "4px", textTransform: "uppercase" }}>Streak ngày</div>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(8px)", padding: "16px 24px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#38bdf8" }}>🪙 {coins}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#a7f3d0", marginTop: "4px", textTransform: "uppercase" }}>Coins</div>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(8px)", padding: "16px 24px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.15)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34d399" }}>⭐ {xp}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#a7f3d0", marginTop: "4px", textTransform: "uppercase" }}>Cấp {level}</div>
            </div>
          </div>
        </div>

        {/* Quest/Onboarding Section */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "32px",
          display: "flex",
          gap: "40px",
          marginBottom: "32px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
        }}>
          {/* Left illustration */}
          <div style={{ width: "35%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
              <img
                src="/images/illustrations/onboarding_guide.png"
                alt="Onboarding Quest Map"
                style={{ width: "100%", height: "260px", objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Right onboarding details */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              Tân thủ nhập cuộc: Nên chơi thế nào? 🎮
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
              LEXI được thiết kế theo dạng trò chơi hóa để học tập thú vị. Thực hiện theo 4 bước đơn giản này để làm chủ kiến thức pháp luật:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
              <div style={{ display: "flex", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e0f2fe", color: "#0369a1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "15px", flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 700, color: "#1e293b" }}>Chọn bài học</h4>
                  <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b", lineHeight: 1.4 }}>Vào <span style={{ color: "#006241", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }} onClick={() => onNavigate("/modules")}>Bản đồ học tập</span> và nhấp vào bài học kế tiếp (nút tròn màu xanh).</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "15px", flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 700, color: "#1e293b" }}>Đọc và ghi nhớ</h4>
                  <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b", lineHeight: 1.4 }}>Xem video tóm tắt 30 giây hoặc đọc tóm tắt lý thuyết có ảnh minh họa trực quan sinh động.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#dcfce7", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "15px", flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 700, color: "#1e293b" }}>Vượt ải Quiz</h4>
                  <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b", lineHeight: 1.4 }}>Trả lời câu hỏi trắc nghiệm tình huống. Vượt qua ải để tích lũy thêm XP và tiền vàng LexiCoins.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f3e8ff", color: "#6b21a8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "15px", flexShrink: 0 }}>4</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 700, color: "#1e293b" }}>Radar ôn tập</h4>
                  <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b", lineHeight: 1.4 }}>Ôn tập các câu trả lời sai tại mục <span style={{ color: "#006241", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }} onClick={() => onNavigate("/review")}>Thành tích</span> hoặc thi đấu tại <span style={{ color: "#006241", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }} onClick={() => onNavigate("/game")}>Đấu trường</span>.</p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => onNavigate("/modules")}
                style={{ background: "#006241", color: "white", border: "none", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "transform 0.2s" }}
              >
                <span>Khám phá Bản đồ học tập</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate("/game")}
                style={{ background: "transparent", color: "#006241", border: "2px solid #006241", padding: "10px 24px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "transform 0.2s" }}
              >
                Đấu trường Game
              </button>
            </div>
          </div>
        </div>

        {/* Lower Grid: AI Recommendations & Recent History */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "32px", marginBottom: "32px" }}>

          {/* AI recommendations */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "#e0f2fe", padding: "6px", borderRadius: "8px", color: "#0284c7", display: "flex" }}>
                <Compass size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>AI Mentor đề xuất học tập</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recs.length > 0 ? recs.map((rec) => (
                <div
                  key={rec.lessonId}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid #f1f5f9", borderRadius: "12px", background: "#fafafa" }}
                >
                  <div style={{ flex: 1, paddingRight: "16px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#0284c7", textTransform: "uppercase" }}>{rec.difficulty === "beginner" ? "Cơ bản" : rec.difficulty === "intermediate" ? "Trung cấp" : "Nâng cao"} • ~{rec.estimatedMinutes} phút</span>
                    <h4 style={{ margin: "4px 0 0", fontSize: "14.5px", fontWeight: 700, color: "#1e293b" }}>{rec.title}</h4>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>{rec.reason}</p>
                  </div>
                  <button
                    onClick={() => onNavigate(`/lessons/${rec.lessonId}`)}
                    style={{ background: "#e0f2fe", color: "#0369a1", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer", flexShrink: 0 }}
                  >
                    Học
                  </button>
                </div>
              )) : (
                <p style={{ color: "#64748b", fontSize: "13px", margin: "10px 0" }}>Đang phân tích lộ trình học của bạn...</p>
              )}
            </div>
          </div>

          {/* Recent History */}
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "#fef3c7", padding: "6px", borderRadius: "8px", color: "#d97706", display: "flex" }}>
                <History size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Bài học gần đây</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {historyList.length > 0 ? historyList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate(`/history/${item.id}`)}
                  style={{ padding: "14px", border: "1px solid #f1f5f9", borderRadius: "12px", cursor: "pointer", transition: "background 0.2s", background: "#fafafa" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                    <span>{item.category.title}</span>
                    <strong style={{ color: item.score >= 80 ? "#16a34a" : "#dc2626" }}>{item.score}%</strong>
                  </div>
                  <h4 style={{ margin: "4px 0 0", fontSize: "13.5px", fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.lessonTitle}</h4>
                </div>
              )) : (
                <p style={{ color: "#64748b", fontSize: "13px", margin: "10px 0" }}>Chưa có hoạt động học tập nào gần đây.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="lexi-landing-root">

      {/* 1. Header Section */}
      {!session && (
        <header className="lexi-landing-header">
          <div className="lexi-landing-header-container">
            <div className="lexi-landing-logo">
              <img src="/logo.jpg" alt="LEXI Logo" style={{ height: "70px", width: "70px", borderRadius: "8px", objectFit: "cover" }} />
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
              <span>Khai Phóng Vẻ Đẹp Di Sản</span>
            </div>

            <h1 className="lexi-landing-hero-title">
              Nâng tầm hiểu biết<br />
              pháp luật cùng <span className="lexi-highlight-green">Lexi</span>
            </h1>

            <p className="lexi-landing-hero-subtitle">
              Làm chủ kiến thức pháp luật qua các bài học nhỏ gọn, được trò chơi hóa. Nhận phần thưởng, xây dựng chuỗi ngày học, và tự tin với kiến thức pháp lý thực tế chỉ với 5 phút mỗi ngày.
            </p>

            <div className="lexi-landing-hero-actions">
              <button className="lexi-btn-primary-green" onClick={handleStart}>
                Bắt đầu vượt ải
              </button>
              <button className="lexi-btn-outline-green" onClick={handleStart}>
                Xem chương trình học
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
            Đăng Ký Ngay
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
