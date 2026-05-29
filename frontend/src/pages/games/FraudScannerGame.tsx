import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  Timer,
  Heart,
  Zap,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft
} from "lucide-react";

type FraudScannerProps = {
  onBack: () => void;
  onReward: (coins: number, xp: number) => void;
};

type FraudMessage = {
  id: string;
  type: "sms" | "email" | "call";
  sender: string;
  content: string;
  isFraud: boolean;
  explanation: string;
};

const FRAUD_MESSAGES: FraudMessage[] = [
  {
    id: "fm-1",
    type: "sms",
    sender: "0987.XXX.456",
    content: "Chúc mừng bạn trúng thưởng 500 triệu VND từ chương trình khách hàng thân thiết! Nhập mã OTP để nhận ngay: bit.ly/nhan-thuong-vn",
    isFraud: true,
    explanation: "Ngân hàng và tổ chức uy tín KHÔNG BAO GIỜ gửi link rút gọn (bit.ly) qua SMS. Đây là chiêu phishing điển hình để đánh cắp thông tin tài khoản."
  },
  {
    id: "fm-2",
    type: "email",
    sender: "thongbao@vnpost.vn",
    content: "Kính gửi Quý khách, Bưu điện Việt Nam thông báo: Bạn có 1 bưu phẩm quốc tế chờ nhận tại bưu cục gần nhất. Vui lòng mang CCCD đến nhận trong 7 ngày.",
    isFraud: false,
    explanation: "Đây là thông báo hợp lệ từ domain chính thức @vnpost.vn. Email thật không yêu cầu chuyển khoản hay cung cấp OTP."
  },
  {
    id: "fm-3",
    type: "call",
    sender: "Số lạ +84.28.3XXX",
    content: "\"Đây là Công an quận Bình Thạnh. Tài khoản ngân hàng của anh/chị đang liên quan đến vụ án rửa tiền xuyên quốc gia. Yêu cầu chuyển toàn bộ tiền vào tài khoản an toàn để điều tra.\"",
    isFraud: true,
    explanation: "Công an KHÔNG BAO GIỜ yêu cầu chuyển tiền qua điện thoại. Đây là thủ đoạn giả danh công an phổ biến. Điều 174 BLHS 2015 về tội lừa đảo chiếm đoạt tài sản."
  },
  {
    id: "fm-4",
    type: "sms",
    sender: "VNPT",
    content: "VNPT: Cước phí tháng 05/2026 của Quý khách là 285.000đ. Hạn thanh toán: 15/06/2026. Chi tiết tại my.vnpt.com.vn. Trân trọng!",
    isFraud: false,
    explanation: "SMS từ brandname VNPT với nội dung thông báo cước phí bình thường, link chính thức my.vnpt.com.vn. Đây là tin nhắn hợp lệ."
  },
  {
    id: "fm-5",
    type: "email",
    sender: "support@shopee-security.com.vn",
    content: "⚠️ TÀI KHOẢN BỊ KHÓA! Shopee phát hiện đăng nhập bất thường. Click ngay link bên dưới để xác minh danh tính trong vòng 24h hoặc tài khoản sẽ bị xóa vĩnh viễn!",
    isFraud: true,
    explanation: "Domain giả mạo 'shopee-security.com.vn' không phải domain chính thức Shopee (shopee.vn). Tạo khẩn cấp giả + link phishing là dấu hiệu lừa đảo điển hình."
  },
  {
    id: "fm-6",
    type: "sms",
    sender: "0912.XXX.789",
    content: "Em ơi, anh đang kẹt tiền, chuyển gấp cho anh 5 triệu vào STK: 1234567890 - Vietcombank nhé. Anh trả ngay chiều nay!",
    isFraud: true,
    explanation: "Tin nhắn giả danh người thân mượn tiền gấp. Luôn gọi điện xác nhận trực tiếp trước khi chuyển. Kẻ gian thường hack Zalo/Facebook để lừa đảo."
  },
  {
    id: "fm-7",
    type: "call",
    sender: "1900.XXX.XXX",
    content: "\"Xin chào, đây là tổng đài hỗ trợ ngân hàng Vietcombank. Thẻ tín dụng của quý khách vừa phát sinh giao dịch 15 triệu đồng. Nếu không phải quý khách thực hiện, vui lòng nhấn phím 1 để hủy giao dịch.\"",
    isFraud: true,
    explanation: "Ngân hàng thật KHÔNG yêu cầu nhấn phím để hủy giao dịch qua tổng đài tự động. Hãy gác máy và gọi lại hotline chính thức in trên thẻ."
  },
  {
    id: "fm-8",
    type: "email",
    sender: "no-reply@thuedientu.gdt.gov.vn",
    content: "Thông báo: Tờ khai thuế TNCN quý II/2026 của bạn đã được tiếp nhận thành công. Mã giao dịch: TX-2026-058291. Truy cập thuedientu.gdt.gov.vn để xem chi tiết.",
    isFraud: false,
    explanation: "Email từ domain chính thức .gdt.gov.vn (Tổng cục Thuế), nội dung bình thường, không yêu cầu thông tin nhạy cảm. Đây là email hợp lệ."
  }
];

export const FraudScannerGame: React.FC<FraudScannerProps> = ({ onBack, onReward }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<null | "correct" | "wrong">(null);
  const [gameOver, setGameOver] = useState(false);
  const [swipeDir, setSwipeDir] = useState<null | "left" | "right">(null);

  const currentMsg = FRAUD_MESSAGES[currentIdx];

  // Timer countdown
  useEffect(() => {
    if (gameOver || isAnswered) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver, isAnswered]);

  function handleClassify(classifiedAsFraud: boolean) {
    if (isAnswered || gameOver) return;

    setIsAnswered(true);
    setSwipeDir(classifiedAsFraud ? "right" : "left");

    const isCorrect = classifiedAsFraud === currentMsg.isFraud;

    if (isCorrect) {
      const multiplier = combo >= 4 ? 3 : combo >= 2 ? 2 : 1;
      setScore((prev) => prev + 10 * multiplier);
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > bestCombo) setBestCombo(newCombo);
      setLastAnswer("correct");
    } else {
      setLives((prev) => prev - 1);
      setCombo(0);
      setLastAnswer("wrong");
      if (lives <= 1) {
        setTimeout(() => setGameOver(true), 1500);
      }
    }
  }

  function handleNext() {
    if (currentIdx >= FRAUD_MESSAGES.length - 1) {
      onReward(10, 20);
      setGameOver(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
      setIsAnswered(false);
      setLastAnswer(null);
      setSwipeDir(null);
    }
  }

  // ── GAME OVER SCREEN ──
  if (gameOver) {
    const answered = currentIdx + (isAnswered ? 1 : 0);
    return (
      <div className="panel lexi-fraud-scanner-workspace lexi-fraud-game-over-container animate-scale-up">
        <div className="lexi-fraud-game-over">
          <div className="lexi-fraud-gameover-icon">
            {lives > 0 ? <ShieldCheck size={56} /> : <ShieldAlert size={56} />}
          </div>
          <h2>{lives > 0 ? "🎉 HOÀN THÀNH XUẤT SẮC!" : "💔 HẾT MẠNG!"}</h2>
          <p>
            {lives > 0
              ? `Bạn đã sàng lọc thành công ${answered}/${FRAUD_MESSAGES.length} tin nhắn!`
              : `Bạn đã sàng lọc ${answered}/${FRAUD_MESSAGES.length} tin nhắn trước khi hết mạng.`}
          </p>
          <div className="lexi-fraud-stats-row">
            <div className="lexi-fraud-stat">
              <strong>{score}</strong>
              <span>Điểm</span>
            </div>
            <div className="lexi-fraud-stat">
              <strong>x{bestCombo}</strong>
              <span>Combo Max</span>
            </div>
            <div className="lexi-fraud-stat">
              <strong>{lives}</strong>
              <span>Mạng còn</span>
            </div>
          </div>
          <div className="lexi-outcome-buttons">
            <button className="lexi-btn-outcome-primary" onClick={() => {
              setCurrentIdx(0);
              setLives(3);
              setScore(0);
              setCombo(0);
              setBestCombo(0);
              setTimeLeft(60);
              setIsAnswered(false);
              setLastAnswer(null);
              setGameOver(false);
              setSwipeDir(null);
            }}>
              <RotateCcw size={16} /> Chơi lại
            </button>
            <button className="lexi-btn-outcome-secondary" onClick={onBack}>
              Quay lại Sảnh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const typeIcon =
    currentMsg?.type === "sms" ? (
      <MessageSquare size={18} />
    ) : currentMsg?.type === "email" ? (
      <Mail size={18} />
    ) : (
      <Phone size={18} />
    );

  const typeLabel =
    currentMsg?.type === "sms"
      ? "Tin nhắn SMS"
      : currentMsg?.type === "email"
        ? "Email"
        : "Cuộc gọi điện thoại";

  // ── MAIN GAME SCREEN ──
  return (
    <div className="panel lexi-fraud-scanner-workspace">
      {/* Header */}
      <div className="lexi-game-active-header">
        <button className="lexi-btn-exit-game" onClick={onBack}>
          <ArrowLeft size={16} /> Thoát Game
        </button>
        <h3 className="lexi-game-active-title">🛡️ Lọc Độc Lừa Đảo</h3>
      </div>
      {/* Top stats bar */}
      <div className="lexi-fraud-top-bar">
        <div className="lexi-fraud-lives">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              size={18}
              className={i < lives ? "fill-red stroke-red" : "stroke-muted"}
            />
          ))}
        </div>
        <div className="lexi-fraud-progress-text">
          {currentIdx + 1} / {FRAUD_MESSAGES.length}
        </div>
        <div className="lexi-fraud-timer">
          <Timer size={16} />
          <span className={timeLeft <= 10 ? "text-danger" : ""}>
            {timeLeft}s
          </span>
        </div>
        {combo >= 2 && (
          <div className="lexi-fraud-combo-badge">
            <Zap size={14} /> x{combo >= 4 ? 3 : 2} Combo!
          </div>
        )}
        <div className="lexi-fraud-score">🏆 {score} điểm</div>
      </div>

      {/* The Message Card */}
      <div
        className={`lexi-fraud-message-card ${swipeDir ? `swipe-${swipeDir}` : "animate-fade-in"} ${lastAnswer || ""}`}
      >
        <div className="lexi-fraud-msg-type-badge">
          {typeIcon}
          <span>{typeLabel}</span>
        </div>
        <div className="lexi-fraud-msg-sender">
          <strong>Từ:</strong> {currentMsg.sender}
        </div>
        <div className="lexi-fraud-msg-content">{currentMsg.content}</div>
      </div>

      {/* Answer Feedback */}
      {isAnswered && (
        <div className={`lexi-fraud-feedback-box ${lastAnswer} animate-fade-in`}>
          <div className="lexi-fraud-feedback-header">
            {lastAnswer === "correct" ? (
              <>
                <CheckCircle2 size={18} />{" "}
                <strong>
                  Chính xác!{" "}
                  {combo >= 2
                    ? `(Combo x${combo >= 4 ? 3 : 2})`
                    : ""}
                </strong>
              </>
            ) : (
              <>
                <XCircle size={18} />{" "}
                <strong>Sai rồi! Mất 1 mạng ❤️</strong>
              </>
            )}
          </div>
          <p className="lexi-fraud-explain">{currentMsg.explanation}</p>
          <button className="lexi-btn-next-fraud" onClick={handleNext}>
            <ChevronRight size={16} /> Tin nhắn tiếp theo
          </button>
        </div>
      )}

      {/* Action Buttons (Safe / Fraud) */}
      {!isAnswered && (
        <div className="lexi-fraud-action-buttons">
          <button
            className="lexi-fraud-btn safe"
            onClick={() => handleClassify(false)}
          >
            <ShieldCheck size={22} />
            <span>AN TOÀN ✓</span>
          </button>
          <button
            className="lexi-fraud-btn danger"
            onClick={() => handleClassify(true)}
          >
            <ShieldAlert size={22} />
            <span>LỪA ĐẢO ✗</span>
          </button>
        </div>
      )}
    </div>
  );
};
