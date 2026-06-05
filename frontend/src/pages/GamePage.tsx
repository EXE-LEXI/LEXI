import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Compass, 
  Award, 
  History, 
  Settings, 
  Flame, 
  Tv, 
  Gamepad2, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  Users,
  ShieldAlert,
  Gavel,
  Bot,
  User,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sliders,
  ArrowLeft
} from "lucide-react";
import type { AuthResponse } from "../types/auth";
import { ROUTES } from "../routes/paths";
import { claimGameReward } from "../api/rewards";
import { gamesApi } from "../api/games";

// Import new game modes
import { FraudScannerGame } from "./games/FraudScannerGame";
import { LawMatcherGame } from "./games/LawMatcherGame";
import { DetectiveRoomGame } from "./games/DetectiveRoomGame";
import { PenaltyPredictorGame } from "./games/PenaltyPredictorGame";

type GamePageProps = {
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
};

type TriviaQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const DUEL_QUESTIONS: TriviaQuestion[] = [
  {
    id: "q-1",
    question: "Sử dụng hình ảnh của người khác để chế giễu, bôi nhọ trên mạng xã hội thường xâm phạm quyền nào?",
    options: [
      "Quyền hình ảnh, danh dự và nhân phẩm",
      "Quyền tự do ngôn luận tuyệt đối",
      "Chỉ là vi phạm nội quy nền tảng"
    ],
    correctIndex: 0,
    explanation: "Bộ luật Dân sự bảo vệ quyền về hình ảnh, danh dự và nhân phẩm của cá nhân."
  },
  {
    id: "q-2",
    question: "Mua bán trái phép thông tin tài khoản ngân hàng của người khác có thể bị xử lý theo nhóm hành vi nào?",
    options: [
      "Vi phạm trật tự xây dựng",
      "Thu thập, tàng trữ, trao đổi, mua bán trái phép thông tin tài khoản",
      "Chỉ là tranh chấp dân sự"
    ],
    correctIndex: 1,
    explanation: "Đây là nhóm hành vi liên quan đến thông tin tài khoản ngân hàng và có thể bị xử lý hình sự nếu đủ điều kiện."
  },
  {
    id: "q-3",
    question: "Người giao hàng tự ý mở gói hàng của khách khi chưa được đồng ý có thể xâm phạm quyền nào?",
    options: [
      "Quyền bí mật đời tư, thư tín và thông tin cá nhân",
      "Quyền sở hữu trí tuệ",
      "Không vi phạm vì người giao hàng luôn được kiểm tra"
    ],
    correctIndex: 0,
    explanation: "Tự ý mở gói hàng có thể xâm phạm bí mật đời tư, thư tín và thông tin cá nhân."
  },
  {
    id: "q-4",
    question: "Khi nhận được cuộc gọi yêu cầu chuyển tiền để xác minh tài khoản, cách xử lý an toàn nhất là gì?",
    options: [
      "Chuyển một khoản nhỏ để kiểm tra",
      "Cung cấp mã OTP nếu người gọi nói là ngân hàng",
      "Dừng cuộc gọi và liên hệ kênh chính thức của ngân hàng"
    ],
    correctIndex: 2,
    explanation: "Không cung cấp OTP hoặc chuyển tiền theo yêu cầu qua cuộc gọi lạ; hãy xác minh qua kênh chính thức."
  },
  {
    id: "q-5",
    question: "Một hợp đồng điện tử có thể có giá trị pháp lý khi nào?",
    options: [
      "Khi các bên có thỏa thuận rõ ràng và dữ liệu có thể xác định nội dung giao dịch",
      "Chỉ khi được in ra giấy",
      "Chỉ khi gửi qua mạng xã hội"
    ],
    correctIndex: 0,
    explanation: "Giao dịch điện tử có thể có giá trị nếu đáp ứng điều kiện về ý chí, nội dung và khả năng xác thực."
  },
  {
    id: "q-6",
    question: "Đăng thông tin cá nhân của người khác lên mạng khi chưa được đồng ý có rủi ro gì?",
    options: [
      "Có thể xâm phạm quyền riêng tư và dữ liệu cá nhân",
      "Luôn được phép nếu thông tin đã từng xuất hiện trên mạng",
      "Không có rủi ro nếu không thu tiền"
    ],
    correctIndex: 0,
    explanation: "Thông tin cá nhân vẫn được bảo vệ; việc công khai trái phép có thể phát sinh trách nhiệm pháp lý."
  },
  {
    id: "q-7",
    question: "Khi mua hàng online, bằng chứng nào nên lưu lại để xử lý tranh chấp?",
    options: [
      "Ảnh chụp đơn hàng, tin nhắn, hóa đơn và thông tin thanh toán",
      "Chỉ cần nhớ tên shop",
      "Không cần lưu vì sàn luôn tự xử lý"
    ],
    correctIndex: 0,
    explanation: "Bằng chứng giao dịch giúp chứng minh nội dung thỏa thuận và yêu cầu khiếu nại."
  },
  {
    id: "q-8",
    question: "Người lao động nên làm gì khi chưa được trả lương đúng hạn?",
    options: [
      "Tự ý lấy tài sản công ty để bù lương",
      "Kiểm tra hợp đồng, bảng công và gửi yêu cầu thanh toán bằng văn bản",
      "Im lặng vì công ty có toàn quyền quyết định"
    ],
    correctIndex: 1,
    explanation: "Nên lưu chứng cứ và yêu cầu bằng văn bản trước khi khiếu nại hoặc yêu cầu cơ quan có thẩm quyền hỗ trợ."
  },
  {
    id: "q-9",
    question: "Khi thuê nhà, điều khoản nào nên được ghi rõ trong hợp đồng?",
    options: [
      "Tiền thuê, tiền cọc, thời hạn thuê, trách nhiệm sửa chữa và điều kiện chấm dứt",
      "Chỉ cần ghi tên chủ nhà",
      "Chỉ cần thỏa thuận miệng để linh hoạt"
    ],
    correctIndex: 0,
    explanation: "Các điều khoản rõ ràng giúp giảm tranh chấp về tiền cọc, nghĩa vụ sửa chữa và thời hạn thuê."
  },
  {
    id: "q-10",
    question: "Nếu phát hiện nội dung lừa đảo trên mạng, bước phù hợp đầu tiên là gì?",
    options: [
      "Chia sẻ lại để cảnh báo nhưng không kiểm chứng",
      "Lưu bằng chứng, báo cáo nền tảng và thông báo cơ quan/kênh hỗ trợ phù hợp",
      "Nhắn tin thỏa thuận riêng với đối tượng lừa đảo"
    ],
    correctIndex: 1,
    explanation: "Cần giữ bằng chứng và báo cáo qua kênh phù hợp để giảm thiệt hại và hỗ trợ xử lý."
  }
];
export const GamePage: React.FC<GamePageProps> = ({ session, onNavigate }) => {
  const [activeMode, setActiveMode] = useState<null | "duel" | "court" | "fraud-scan" | "law-match" | "detective" | "penalty">(null);
  
  // Stats
  const [userCoins, setUserCoins] = useState(session?.user?.profile?.xp ? Math.floor(session.user.profile.xp / 3) : 450);
  const [userXp, setUserXp] = useState(session?.user?.profile?.xp || 1200);
  const userStreak = session?.user?.profile?.streak || 12;
  const [rewardNotice, setRewardNotice] = useState<string | null>(null);

  // State for Mode 1: Duel Arena
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isDuelAnswered, setIsDuelAnswered] = useState(false);
  const [duelCombatLog, setDuelCombatLog] = useState("Trận đấu bắt đầu! Bạn đối đầu với LexiBot.");
  const [duelOutcome, setDuelOutcome] = useState<null | "victory" | "defeat">(null);
  const [speedBonus, setSpeedBonus] = useState(3); // 3x multiplier
  const [timerProgress, setTimerProgress] = useState(100);

  // State for Mode 2: Court Simulator
  const [courtStage, setCourtStage] = useState<"file" | "witness" | "verdict" | "complete">("file");
  const [courtSelectedDecision, setCourtSelectedDecision] = useState<number | null>(null);
  const [courtLog, setCourtLog] = useState("");

  // Duel Speed Timer Simulation
  useEffect(() => {
    if (activeMode !== "duel" || isDuelAnswered || duelOutcome) return;

    const interval = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          // Timeout counts as incorrect answer
          handleDuelAnswer(-1);
          return 0;
        }
        return prev - 1.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeMode, activeQIdx, isDuelAnswered, duelOutcome]);

  const fullName = session?.user?.profile?.fullName || session?.user?.email || "Học viên";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // DUEL ACTIONS
  function handleStartDuel() {
    setActiveMode("duel");
    setPlayerHp(100);
    setEnemyHp(100);
    setActiveQIdx(0);
    setSelectedOpt(null);
    setIsDuelAnswered(false);
    setDuelCombatLog("Trận đấu bắt đầu! Hãy trả lời nhanh để nhận hệ số tốc độ.");
    setDuelOutcome(null);
    setTimerProgress(100);
    setSpeedBonus(3);
  }

  function handleDuelAnswer(optIdx: number) {
    if (isDuelAnswered || duelOutcome) return;

    setSelectedOpt(optIdx);
    setIsDuelAnswered(true);

    const question = DUEL_QUESTIONS[activeQIdx];
    const isCorrect = optIdx === question.correctIndex;

    if (isCorrect) {
      const damage = Math.round(25 * (timerProgress > 50 ? 1.5 : 1));
      const nextEnemyHp = Math.max(enemyHp - damage, 0);
      setEnemyHp(nextEnemyHp);
      setDuelCombatLog(`Chính xác! Bạn gây -${damage} HP lên LexiBot. Tốc độ: ${timerProgress > 50 ? "nhanh 1.5x" : "bình thường"}.`);

      if (nextEnemyHp <= 0) {
        setTimeout(() => {
          setDuelOutcome("victory");
          setUserCoins((prev) => prev + 15);
          setUserXp((prev) => prev + 30);
        }, 1200);
      }
    } else {
      const damage = 20;
      const nextPlayerHp = Math.max(playerHp - damage, 0);
      setPlayerHp(nextPlayerHp);
      setDuelCombatLog(optIdx === -1 
        ? `Quá thời gian! Bạn bị LexiBot phản công gây -${damage} HP.`
        : `Chưa đúng! Bạn bị LexiBot phản công gây -${damage} HP. Đáp án đúng là ${String.fromCharCode(65 + question.correctIndex)}.`
      );

      if (nextPlayerHp <= 0) {
        setTimeout(() => {
          setDuelOutcome("defeat");
        }, 1200);
      }
    }
  }

  function handleNextDuelQuestion() {
    if (activeQIdx < DUEL_QUESTIONS.length - 1) {
      setActiveQIdx(activeQIdx + 1);
      setSelectedOpt(null);
      setIsDuelAnswered(false);
      setTimerProgress(100);
      setDuelCombatLog("Lượt đấu tiếp theo! Hãy chuẩn bị phản xạ.");
    } else {
      // Out of questions but no one died: compare HPs
      if (enemyHp < playerHp) {
        setDuelOutcome("victory");
        setUserCoins((prev) => prev + 15);
        setUserXp((prev) => prev + 30);
      } else {
        setDuelOutcome("defeat");
      }
    }
  }

  // COURT SIMULATOR ACTIONS
  function handleStartCourt() {
    setActiveMode("court");
    setCourtStage("file");
    setCourtSelectedDecision(null);
    setCourtLog("");
  }

  function handleCourtVerdict() {
    if (courtSelectedDecision === null) return;
    
    setCourtStage("complete");
    void handleGameReward(20, 40, "court-simulator");

    if (courtSelectedDecision === 0) {
      setCourtLog("Gõ búa! Bạn tuyên bố bảo hộ quyền tác giả cho Họa sĩ vì đóng góp tinh chỉnh tay là sáng tạo thực tế. Quyết định được Bồi thẩm đoàn tán thưởng nhiệt liệt!");
    } else if (courtSelectedDecision === 1) {
      setCourtLog("Gõ búa! Bạn bác bỏ quyền tác giả, phán quyết sản phẩm AI thuộc sở hữu công cộng. Cộng đồng ủng hộ vì tự do sử dụng, nhưng độ chuẩn xác pháp lý gây tranh cãi.");
    } else {
      setCourtLog("Gõ búa! Bạn tuyên hủy án yêu cầu tự hòa giải. Cả hai bên đều bất bình, độ tin cậy của tòa án bị sụt giảm nhẹ.");
    }
  }

  async function handleGameReward(coins: number, xp: number, gameCode = activeMode || "game") {
    setUserXp((prev) => prev + xp);
    setRewardNotice(null);

    if (!session?.accessToken) {
      setUserCoins((prev) => prev + coins);
      return;
    }

    try {
      const reward = await claimGameReward(session.accessToken, {
        gameCode,
        score: Math.min(100, Math.max(1, coins * 10)),
        idempotencyKey: `${gameCode}:${Date.now()}:${Math.random().toString(36).slice(2)}`,
      });
      // Also record the attempt history in backend
      await gamesApi.submitAttempt(gameCode, Math.min(100, Math.max(1, coins * 10)), { coinsAwarded: reward.coinsAwarded }).catch(console.error);

      setUserCoins(reward.coinBalance);
      setRewardNotice(
        reward.coinsAwarded > 0
          ? `+${reward.coinsAwarded} LC đã được ghi vào ví điểm.`
          : "Bạn đã chạm giới hạn điểm game trong ngày."
      );
    } catch (err) {
      setUserCoins((prev) => prev + coins);
      setRewardNotice(
        err instanceof Error
          ? `Chưa đồng bộ được điểm game: ${err.message}`
          : "Chưa đồng bộ được điểm game."
      );
    }
  }

  return (
    <div className="lexi-game-root">
      <div className="lexi-game-container">
        
        {/* =======================================================
           LEFT SIDEBAR NAVIGATION
           ======================================================= */}
        <aside className="lexi-game-sidebar">
          <div className="lexi-sidebar-logo-block">
            <span className="lexi-sidebar-logo">Lexi</span>
          </div>

          <nav className="lexi-sidebar-menu">
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.home); }}>
              <LayoutDashboard size={18} />
              <span>Tổng quan</span>
            </a>
            <a href="/modules" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.modules); }}>
              <Compass size={18} />
              <span>Khóa học của tôi</span>
            </a>
            <a href="/review" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.review); }}>
              <Award size={18} />
              <span>Thành tích</span>
            </a>
            <a href="/history" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.history); }}>
              <History size={18} />
              <span>Lịch sử học</span>
            </a>
            <a href="/shorts" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.shorts); }}>
              <Tv size={18} />
              <span>Video Ngắn</span>
            </a>
            <a href="/game" className="active" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.game); }}>
              <Gamepad2 size={18} />
              <span>Đấu trường Game</span>
            </a>
            <a href="/settings" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.settings); }}>
              <Settings size={18} />
              <span>Cài đặt</span>
            </a>
          </nav>

          <div className="lexi-sidebar-footer">
            <div className="lexi-sidebar-user-card">
              <div className="lexi-sidebar-avatar">{initials}</div>
              <div className="lexi-sidebar-user-info">
                <strong>{fullName}</strong>
                <span>Cấp độ 12 • Hạng Vàng</span>
              </div>
            </div>

            <button 
              className="lexi-sidebar-btn-premium"
              onClick={() => onNavigate(ROUTES.subscription)}
            >
              Nâng cấp Premium
            </button>
          </div>
        </aside>

        {/* =======================================================
           RIGHT MAIN WORKSPACE
           ======================================================= */}
        <main className="lexi-game-main-layout">
          
          {/* Header row */}
          <header className="lexi-game-header">
            <div className="lexi-game-header-left">
              <h2>Đấu trường Lexi</h2>
              <p>Học luật qua du đấu phản xạ & Nghị án thực tế</p>
            </div>

            <div className="lexi-game-header-right">
              <span className="lexi-game-pill orange">
                <Flame size={14} className="fill-orange" />
                <span>{userStreak} ngày</span>
              </span>
              <span className="lexi-game-pill green">
                <span>🪙</span>
                <span>{userCoins} LC</span>
              </span>
              <span className="lexi-game-pill xp-pill">
                <span>⚡ {userXp} XP</span>
              </span>
            </div>
          </header>

          {rewardNotice && (
            <div className="lexi-inline-notice" style={{ marginBottom: "16px" }}>
              {rewardNotice}
            </div>
          )}

          {/* 1. SELECTION STAGE (Mode select) */}
          {activeMode === null && (
            <div className="lexi-game-mode-grid">
              
              {/* Card Mode 1 */}
              <div className="panel lexi-game-card-select card-duel">
                <div className="lexi-game-card-icon duel-icon">
                  <Zap size={32} />
                </div>
                <h3>Đấu trường Tốc độ</h3>
                <p>Thi đấu trực tiếp với Robot LexiBot 9000! Trả lời cực nhanh để nhân sát thương (HP) hạ gục đối thủ, kiểm tra phản xạ pháp lý tức thời.</p>
                <ul className="lexi-game-rewards-bullets">
                  <li>⚡ Nhận thưởng: <strong>+15 Lexi Coins</strong></li>
                  <li>🔥 Thử thách trả lời siêu tốc trong 6 giây</li>
                  <li>👾 Đấu trường HP đối kháng</li>
                </ul>
                <button className="lexi-btn-start-game-mode" onClick={handleStartDuel}>
                  VÀO ĐẤU TRƯỜNG
                </button>
              </div>

              {/* Card Mode 2 */}
              <div className="panel lexi-game-card-select card-court">
                <div className="lexi-game-card-icon court-icon">
                  <Gavel size={32} />
                </div>
                <h3>Phiên tòa Giả lập</h3>
                <p>Nhập vai Thẩm phán phán quyết các vụ án hóc búa đời thực (NFT, tranh chấp đất đai, lừa đảo). Xem lời khai nhân chứng, đánh giá chứng cứ và tuyên án!</p>
                <ul className="lexi-game-rewards-bullets">
                  <li>⚡ Nhận thưởng: <strong>+20 Lexi Coins</strong></li>
                  <li>⚖️ Đo lường Công lý, Bồi thẩm đoàn & Dư luận</li>
                  <li>📁 Đọc hồ sơ & Xét hỏi nhân chứng</li>
                </ul>
                <button className="lexi-btn-start-game-mode special" onClick={handleStartCourt}>
                  MỞ PHIÊN TÒA
                </button>
              </div>

              {/* Card Mode 3: Fraud Scanner */}
              <div className="panel lexi-game-card-select card-fraud">
                <div className="lexi-game-card-icon scan-icon" style={{ color: "#f43f5e" }}>
                  <ShieldAlert size={32} />
                </div>
                <h3>Lọc Độc Lừa Đảo</h3>
                <p>Sàng lọc nhanh các tin nhắn, email và cuộc gọi lạ. Phát hiện thủ đoạn lừa đảo công nghệ cao tinh vi trước khi sập bẫy kẻ xấu!</p>
                <ul className="lexi-game-rewards-bullets">
                  <li>⚡ Nhận thưởng: <strong>+10 Lexi Coins</strong></li>
                  <li>📱 Nhận diện SMS, Email & Cuộc gọi giả mạo</li>
                  <li>🔥 Hệ thống combo streak nhân điểm thưởng</li>
                </ul>
                <button className="lexi-btn-start-game-mode" onClick={() => setActiveMode("fraud-scan")}>
                  BẮT ĐẦU QUÉT
                </button>
              </div>

              {/* Card Mode 4: Law Matcher */}
              <div className="panel lexi-game-card-select card-match">
                <div className="lexi-game-card-icon match-icon" style={{ color: "#3b82f6" }}>
                  <ArrowRight size={32} />
                </div>
                <h3>Ghép Cặp Pháp Luật</h3>
                <p>Thách thức tư duy kết nối! Nối liền các tình huống vi phạm dân sự/hình sự thực tế với đúng điều khoản quy định tương ứng.</p>
                <ul className="lexi-game-rewards-bullets">
                  <li>⚡ Nhận thưởng: <strong>+12 Lexi Coins</strong></li>
                  <li>🔗 Ghép nối tình huống thực tiễn và căn cứ luật</li>
                  <li>📚 Xem giải thích luật chi tiết sau mỗi cặp ghép</li>
                </ul>
                <button className="lexi-btn-start-game-mode" onClick={() => setActiveMode("law-match")}>
                  GHÉP CẶP NGAY
                </button>
              </div>

              {/* Card Mode 5: Detective Room */}
              <div className="panel lexi-game-card-select card-detective">
                <div className="lexi-game-card-icon detective-icon" style={{ color: "#a855f7" }}>
                  <BookOpen size={32} />
                </div>
                <h3>Văn Phòng Thám Tử</h3>
                <p>Đóng vai điều tra viên chuyên nghiệp. Khám xét hiện trường phòng kỹ thuật, xâu chuỗi chứng cứ số và đối chất nghi phạm vụ án mạng/kinh tế!</p>
                <ul className="lexi-game-rewards-bullets">
                  <li>⚡ Nhận thưởng: <strong>+25 Lexi Coins</strong></li>
                  <li>🔍 Khám nghiệm hiện trường & log bảo mật</li>
                  <li>💬 Hỏi đáp chiến thuật & Phán quyết tội danh</li>
                </ul>
                <button className="lexi-btn-start-game-mode special" onClick={() => setActiveMode("detective")}>
                  MỞ VỤ ÁN
                </button>
              </div>

              {/* Card Mode 6: Penalty Predictor */}
              <div className="panel lexi-game-card-select card-penalty">
                <div className="lexi-game-card-icon predictor-icon" style={{ color: "#10b981" }}>
                  <Sliders size={32} />
                </div>
                <h3>Dự Đoán Khung Hình</h3>
                <p>Dựa trên hồ sơ vụ án cụ thể, cân nhắc các tình tiết tăng nặng/giảm nhẹ để đưa ra mức phạt tiền hay số năm tù giam sát với quy định Tòa án nhất.</p>
                <ul className="lexi-game-rewards-bullets">
                  <li>⚡ Nhận thưởng: <strong>+8 Lexi Coins</strong></li>
                  <li>📏 Sử dụng thanh trượt ước lượng hình phạt</li>
                  <li>⚖️ Rèn luyện khả năng lượng hình chuẩn xác</li>
                </ul>
                <button className="lexi-btn-start-game-mode" onClick={() => setActiveMode("penalty")}>
                  ƯỚC LƯỢNG HÌNH PHẠT
                </button>
              </div>

            </div>
          )}

          {/* 2. MODE 1: SPEED DUEL ARENA */}
          {activeMode === "duel" && (
            <div className="panel lexi-game-duel-workspace">
              {/* Header */}
              <div className="lexi-game-active-header">
                <button className="lexi-btn-exit-game" onClick={() => setActiveMode(null)}>
                  <ArrowLeft size={16} /> Thoát Game
                </button>
                <h3 className="lexi-game-active-title">⚔️ Đấu trường Tốc độ</h3>
              </div>
              
              {/* Outcome overlay screens */}
              {duelOutcome && (
                <div className={`lexi-duel-outcome-screen ${duelOutcome}`}>
                  <h2>{duelOutcome === "victory" ? "🏆 CHIẾN THẮNG!" : "💀 THẤT BẠI!"}</h2>
                  <p>
                    {duelOutcome === "victory" 
                      ? `Chúc mừng bạn đã đánh bại LexiBot 9000! Nhận ngay +15 LC & +30 XP!`
                      : `LexiBot đã chiến thắng lượt đấu này! Đừng nản chí, hãy trang bị lại kiến thức pháp luật và thử lại.`
                    }
                  </p>
                  <div className="lexi-outcome-buttons">
                    <button className="lexi-btn-outcome-primary" onClick={handleStartDuel}>
                      <RotateCcw size={16} /> Chơi lại
                    </button>
                    <button className="lexi-btn-outcome-secondary" onClick={() => setActiveMode(null)}>
                      Quay lại Sảnh
                    </button>
                  </div>
                </div>
              )}

              {/* Combat HP Header */}
              <div className="lexi-duel-combat-header">
                {/* Player side */}
                <div className="lexi-combat-character">
                  <div className="lexi-char-avatar player-avatar">
                    <User size={24} />
                  </div>
                  <div className="lexi-char-info">
                    <strong>{fullName}</strong>
                    <div className="lexi-hp-track">
                      <span className="lexi-hp-fill green" style={{ width: `${playerHp}%` }}></span>
                    </div>
                    <span>{playerHp} / 100 HP</span>
                  </div>
                </div>

                {/* VS center icon */}
                <div className="lexi-vs-badge">VS</div>

                {/* Enemy AI side */}
                <div className="lexi-combat-character enemy">
                  <div className="lexi-char-avatar enemy-avatar">
                    <Bot size={24} />
                  </div>
                  <div className="lexi-char-info">
                    <strong>LexiBot 9000</strong>
                    <div className="lexi-hp-track">
                      <span className="lexi-hp-fill red" style={{ width: `${enemyHp}%` }}></span>
                    </div>
                    <span>{enemyHp} / 100 HP</span>
                  </div>
                </div>
              </div>

              {/* Combat Logs display */}
              <div className="lexi-duel-combat-log-banner">
                <span className="lexi-combat-log-pulse"></span>
                <p>{duelCombatLog}</p>
              </div>

              {/* Core trivia quiz feed */}
              {!duelOutcome && DUEL_QUESTIONS[activeQIdx] && (
                <div className="lexi-duel-quiz-arena">
                  <div className="lexi-duel-progress-bar-line">
                    <span 
                      className="lexi-duel-progress-line-fill" 
                      style={{ 
                        width: `${timerProgress}%`,
                        backgroundColor: timerProgress > 50 ? "#006241" : timerProgress > 25 ? "#f5a623" : "#ef4444" 
                      }}
                    ></span>
                  </div>

                  <div className="lexi-duel-question-box">
                    <span>Lượt {activeQIdx + 1}/3 • Multiplier {timerProgress > 50 ? "⚡ 1.5x" : "1.0x"}</span>
                    <h4>{DUEL_QUESTIONS[activeQIdx].question}</h4>
                  </div>

                  <div className="lexi-duel-options-grid">
                    {DUEL_QUESTIONS[activeQIdx].options.map((opt, idx) => {
                      let btnState = "";
                      if (isDuelAnswered) {
                        if (idx === DUEL_QUESTIONS[activeQIdx].correctIndex) {
                          btnState = "correct";
                        } else if (idx === selectedOpt) {
                          btnState = "wrong";
                        } else {
                          btnState = "disabled";
                        }
                      } else if (idx === selectedOpt) {
                        btnState = "selected";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`lexi-duel-option-btn ${btnState}`}
                          onClick={() => handleDuelAnswer(idx)}
                          disabled={isDuelAnswered}
                        >
                          <span className="lexi-duel-opt-bullet">{String.fromCharCode(65 + idx)}</span>
                          <span className="lexi-duel-opt-text">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isDuelAnswered && (
                    <div className="lexi-duel-explain-box">
                      <p><strong>Giải thích:</strong> {DUEL_QUESTIONS[activeQIdx].explanation}</p>
                      <button className="lexi-btn-next-duel-turn" onClick={handleNextDuelQuestion}>
                        Lượt kế tiếp
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* 3. MODE 2: MOCK COURTROOM SIMULATOR */}
          {activeMode === "court" && (
            <div className="panel lexi-court-workspace">
              {/* Header */}
              <div className="lexi-game-active-header">
                <button className="lexi-btn-exit-game" onClick={() => setActiveMode(null)}>
                  <ArrowLeft size={16} /> Thoát Game
                </button>
                <h3 className="lexi-game-active-title">⚖️ Phiên tòa Giả lập</h3>
              </div>
              
              {/* Top Trial progress states */}
              <div className="lexi-court-stage-indicators">
                <span className={`court-step ${courtStage === "file" ? "active" : "done"}`}>
                  1. Hồ Sơ Vụ Án
                </span>
                <span className={`court-step ${courtStage === "witness" ? "active" : courtStage === "file" ? "" : "done"}`}>
                  2. Xét Hỏi Nhân Chứng
                </span>
                <span className={`court-step ${courtStage === "verdict" ? "active" : courtStage === "complete" ? "done" : ""}`}>
                  3. Tuyên Án Phán Quyết
                </span>
              </div>

              {/* Stage A: Case Folder file */}
              {courtStage === "file" && (
                <div className="lexi-court-file-room animate-fade-in">
                  <div className="lexi-court-card-header">
                    <BookOpen size={20} className="text-emerald" />
                    <h3>VỤ ÁN TRANH CHẤP BẢN QUYỀN AI ART NFT</h3>
                  </div>

                  <div className="lexi-court-case-brief-card">
                    <div className="lexi-brief-row">
                      <strong>Nguyên đơn:</strong> <span>Họa sĩ A (Nhà sáng tạo Kỹ thuật số)</span>
                    </div>
                    <div className="lexi-brief-row">
                      <strong>Bị đơn:</strong> <span>Công ty Công nghệ B (Kinh doanh game)</span>
                    </div>
                    <div className="lexi-brief-row">
                      <strong>Nội dung vụ kiện:</strong>
                      <p className="lexi-brief-description-text">
                        Họa sĩ A kiện Công ty B vì đã tự ý tải về tác phẩm tranh nghệ thuật kỹ thuật số do A tạo ra bằng phần mềm vẽ AI (có sự tinh chỉnh, vẽ đè vẽ tay thêm 200 giờ), mint tác phẩm thành dạng vật phẩm NFT và kinh doanh thương mại trên sàn mở mà không xin phép, không phân chia doanh thu. Công ty B lập luận rằng tác phẩm AI tạo ra không thuộc đối tượng bảo hộ quyền tác giả theo Luật Sở hữu Trí tuệ Việt Nam nên có quyền tự do khai thác...
                      </p>
                    </div>
                  </div>

                  <button className="lexi-btn-court-next" onClick={() => setCourtStage("witness")}>
                    MỞ PHIÊN TÒA: XÉT HỎI NHÂN CHỨNG »
                  </button>
                </div>
              )}

              {/* Stage B: Witness stands testimonies */}
              {courtStage === "witness" && (
                <div className="lexi-court-witness-room animate-fade-in">
                  <div className="lexi-court-card-header">
                    <Users size={20} className="text-emerald" />
                    <h3>LỜI KHAI TRÊN BỤC NHÂN CHỨNG</h3>
                  </div>

                  <div className="lexi-witness-speeches-grid">
                    {/* Witness A */}
                    <div className="lexi-witness-speech-card">
                      <div className="lexi-witness-avatar pl">A</div>
                      <div className="lexi-witness-speech-bubble">
                        <strong>Lời khai của Họa sĩ A (Nguyên đơn):</strong>
                        <p>“Đúng là tôi sử dụng Generative AI để lấy ý tưởng ban đầu. Nhưng tôi đã bỏ ra hơn 200 giờ vẽ tay, chải vẽ đè, xử lý ánh sáng và hiệu ứng số bằng tay để tác phẩm đạt độ hoàn hảo. Đây là công sức lao động trí óc sáng tạo cực kỳ nghiêm túc của cá nhân tôi!”</p>
                      </div>
                    </div>

                    {/* Witness B */}
                    <div className="lexi-witness-speech-card enemy">
                      <div className="lexi-witness-avatar en">B</div>
                      <div className="lexi-witness-speech-bubble">
                        <strong>Lời khai Đại diện Công ty B (Bị đơn):</strong>
                        <p>“Theo quy định của Luật Sở hữu Trí tuệ, tác giả phải là người trực tiếp sáng tạo. Tác phẩm do AI vẽ không thuộc sở hữu con người nên không thể bảo hộ bản quyền. Chúng tôi hoàn toàn có quyền thương mại hóa tác phẩm NFT này!”</p>
                      </div>
                    </div>
                  </div>

                  <button className="lexi-btn-court-next" onClick={() => setCourtStage("verdict")}>
                    BƯỚC VÀO NGHỊ ÁN & TUYÊN ÁN »
                  </button>
                </div>
              )}

              {/* Stage C: Deliberation rulings & impact scores */}
              {courtStage === "verdict" && (
                <div className="lexi-court-verdict-room animate-fade-in">
                  <div className="lexi-court-card-header">
                    <ShieldAlert size={20} className="text-emerald" />
                    <h3>NGHỊ ÁN: CHỌN PHÁN QUYẾT BẤM BÚA</h3>
                  </div>

                  <p className="lexi-verdict-instruction">
                    Hãy xem xét cẩn thận chứng cứ và chọn 1 phán quyết công bằng nhất. Mỗi phán quyết sẽ chấm điểm sức ảnh hưởng của bạn lên 3 chiều: Công lý (Accurate), Bồi thẩm đoàn (Juror), Dư luận (Public).
                  </p>

                  <div className="lexi-verdict-decisions-list">
                    
                    {/* Decision 1 */}
                    <div 
                      className={`lexi-verdict-decision-option ${courtSelectedDecision === 0 ? "active" : ""}`}
                      onClick={() => setCourtSelectedDecision(0)}
                    >
                      <div className="lexi-decision-radio-bullet"></div>
                      <div className="lexi-decision-desc-content">
                        <strong>Phán quyết A: Chấp thuận đơn kiện của Họa sĩ A</strong>
                        <p>Công nhận quyền tác giả của Họa sĩ A vì sự đóng góp thủ công đáng kể (200 giờ vẽ đè) thể hiện dấu ấn sáng tạo con người, bắt buộc Công ty B bồi thường doanh thu NFT.</p>
                        <div className="lexi-verdict-meters-row">
                          <span className="lexi-verdict-meter-pill green">⚖️ Công lý: 95%</span>
                          <span className="lexi-verdict-meter-pill green">👥 Bồi thẩm đoàn: 90%</span>
                          <span className="lexi-verdict-meter-pill green">📢 Dư luận: 85%</span>
                        </div>
                      </div>
                    </div>

                    {/* Decision 2 */}
                    <div 
                      className={`lexi-verdict-decision-option ${courtSelectedDecision === 1 ? "active" : ""}`}
                      onClick={() => setCourtSelectedDecision(1)}
                    >
                      <div className="lexi-decision-radio-bullet"></div>
                      <div className="lexi-decision-desc-content">
                        <strong>Phán quyết B: Bác đơn kiện, tuyên bố thuộc sở hữu công cộng</strong>
                        <p>Tuyên bố tác phẩm do AI tạo ra không thuộc đối tượng bảo hộ quyền tác giả theo luật sở hữu trí tuệ hiện hành, cho phép tự do sử dụng thương mại mà không cần chia hoa hồng.</p>
                        <div className="lexi-verdict-meters-row">
                          <span className="lexi-verdict-meter-pill orange">⚖️ Công lý: 60%</span>
                          <span className="lexi-verdict-meter-pill green">👥 Bồi thẩm đoàn: 70%</span>
                          <span className="lexi-verdict-meter-pill green">📢 Dư luận: 80%</span>
                        </div>
                      </div>
                    </div>

                    {/* Decision 3 */}
                    <div 
                      className={`lexi-verdict-decision-option ${courtSelectedDecision === 2 ? "active" : ""}`}
                      onClick={() => setCourtSelectedDecision(2)}
                    >
                      <div className="lexi-decision-radio-bullet"></div>
                      <div className="lexi-decision-desc-content">
                        <strong>Phán quyết C: Đình chỉ vụ kiện, yêu cầu hai bên tự thỏa thuận</strong>
                        <p>Từ chối xét xử vì tính chất phức tạp và thiếu quy phạm trực tiếp cho tác phẩm AI, yêu cầu hai bên tự hòa giải thương lượng doanh thu ngoài tòa án.</p>
                        <div className="lexi-verdict-meters-row">
                          <span className="lexi-verdict-meter-pill red">⚖️ Công lý: 40%</span>
                          <span className="lexi-verdict-meter-pill red">👥 Bồi thẩm đoàn: 30%</span>
                          <span className="lexi-verdict-meter-pill orange">📢 Dư luận: 50%</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  <button 
                    className="lexi-btn-submit-verdict-hammer" 
                    disabled={courtSelectedDecision === null}
                    onClick={handleCourtVerdict}
                  >
                    🔨 GÕ BÚA TUYÊN ÁN (+20 LC)
                  </button>
                </div>
              )}

              {/* Stage D: Verdict complete screen */}
              {courtStage === "complete" && (
                <div className="lexi-court-complete-screen animate-scale-up shake-screen strike-flash">
                  <div className="lexi-verdict-hammer-animation">
                    <Gavel size={54} className="gavel-icon-spin" />
                  </div>
                  <h2>PHÁN QUYẾT ĐÃ ĐƯỢC TUYÊN!</h2>
                  
                  <div className="lexi-court-verdict-log">
                    <p>{courtLog}</p>
                  </div>

                  <div className="lexi-court-verdict-impact-results-box">
                    <h3>CHỈ SỐ THẨM PHÁN ĐẠT ĐƯỢC:</h3>
                    <div className="lexi-verdict-bars-group">
                      
                      <div className="lexi-verdict-progress-track-row">
                        <span>⚖️ Độ chuẩn xác Công lý:</span>
                        <div className="lexi-verdict-bar-track">
                          <span 
                            className="lexi-verdict-bar-fill" 
                            style={{ 
                              width: courtSelectedDecision === 0 ? "95%" : courtSelectedDecision === 1 ? "60%" : "40%",
                              backgroundColor: courtSelectedDecision === 0 ? "#10b981" : courtSelectedDecision === 1 ? "#f5a623" : "#ef4444"
                            }}
                          ></span>
                        </div>
                        <strong>{courtSelectedDecision === 0 ? "95%" : courtSelectedDecision === 1 ? "60%" : "40%"}</strong>
                      </div>

                      <div className="lexi-verdict-progress-track-row">
                        <span>👥 Bồi thẩm đoàn ủng hộ:</span>
                        <div className="lexi-verdict-bar-track">
                          <span 
                            className="lexi-verdict-bar-fill" 
                            style={{ 
                              width: courtSelectedDecision === 0 ? "90%" : courtSelectedDecision === 1 ? "70%" : "30%",
                              backgroundColor: courtSelectedDecision === 0 ? "#10b981" : courtSelectedDecision === 1 ? "#f5a623" : "#ef4444"
                            }}
                          ></span>
                        </div>
                        <strong>{courtSelectedDecision === 0 ? "90%" : courtSelectedDecision === 1 ? "70%" : "30%"}</strong>
                      </div>

                      <div className="lexi-verdict-progress-track-row">
                        <span>📢 Lòng tin Dư luận:</span>
                        <div className="lexi-verdict-bar-track">
                          <span 
                            className="lexi-verdict-bar-fill" 
                            style={{ 
                              width: courtSelectedDecision === 0 ? "85%" : courtSelectedDecision === 1 ? "80%" : "50%",
                              backgroundColor: courtSelectedDecision === 0 ? "#10b981" : courtSelectedDecision === 1 ? "#f5a623" : "#ef4444"
                            }}
                          ></span>
                        </div>
                        <strong>{courtSelectedDecision === 0 ? "85%" : courtSelectedDecision === 1 ? "80%" : "50%"}</strong>
                      </div>

                    </div>
                  </div>

                  <p className="lexi-court-rewards-notif">
                    🎁 Bạn đã nhận được **+20 Lexi Coins** & **+40 XP** danh giá!
                  </p>

                  <div className="lexi-outcome-buttons text-center">
                    <button className="lexi-btn-outcome-primary" onClick={handleStartCourt}>
                      <RotateCcw size={16} /> Xử lý vụ án mới
                    </button>
                    <button className="lexi-btn-outcome-secondary" onClick={() => setActiveMode(null)}>
                      Quay lại Sảnh
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 4. MODE 3: FRAUD SCANNER */}
          {activeMode === "fraud-scan" && (
            <FraudScannerGame 
              onBack={() => setActiveMode(null)} 
              onReward={handleGameReward} 
            />
          )}

          {/* 5. MODE 4: LAW MATCHER */}
          {activeMode === "law-match" && (
            <LawMatcherGame 
              onBack={() => setActiveMode(null)} 
              onReward={handleGameReward} 
            />
          )}

          {/* 6. MODE 5: DETECTIVE ROOM */}
          {activeMode === "detective" && (
            <DetectiveRoomGame 
              onBack={() => setActiveMode(null)} 
              onReward={handleGameReward} 
            />
          )}

          {/* 7. MODE 6: PENALTY PREDICTOR */}
          {activeMode === "penalty" && (
            <PenaltyPredictorGame 
              onBack={() => setActiveMode(null)} 
              onReward={handleGameReward} 
            />
          )}

        </main>

      </div>
    </div>
  );
};

