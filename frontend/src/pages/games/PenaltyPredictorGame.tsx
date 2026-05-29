import React, { useState } from "react";
import { 
  RotateCcw, 
  ChevronRight, 
  Award,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

type PenaltyPredictorProps = {
  onBack: () => void;
  onReward: (coins: number, xp: number) => void;
};

type CaseScenario = {
  id: string;
  title: string;
  scenario: string;
  fineRange: { min: number; max: number; unit: string };
  prisonRange: { min: number; max: number; unit: string };
  correctType: "prison" | "fine" | "reform";
  correctValue: number; // e.g. 3 years, or 50 million
  correctText: string;
  explanation: string;
};

const SCENARIOS: CaseScenario[] = [
  {
    id: "ps-1",
    title: "Vụ án 1: Trộm cắp tài sản giá trị lớn",
    scenario: "Bị cáo A đột nhập nhà dân lấy trộm một chiếc xe máy và một số trang sức tổng trị giá 80 triệu đồng. Bị cáo phạm tội lần đầu, thành khẩn khai báo và gia đình đã tự nguyện bồi thường 100% thiệt hại cho bị hại.",
    fineRange: { min: 5, max: 50, unit: "triệu VNĐ" },
    prisonRange: { min: 2, max: 7, unit: "năm tù" },
    correctType: "prison",
    correctValue: 3, // average or standard for mitigating circumstances (2-7 years frame)
    correctText: "Phạt tù từ 2 đến 7 năm (Khoản 2 Điều 173 BLHS 2015)",
    explanation: "Trộm cắp tài sản trị giá từ 50 triệu đến dưới 200 triệu đồng thuộc Khoản 2 Điều 173 với khung hình phạt 2-7 năm tù. Do có nhiều tình tiết giảm nhẹ (thành khẩn, khắc phục hậu quả, phạm tội lần đầu), Tòa án thường áp dụng mức phạt cận dưới khoảng 2 đến 3 năm tù."
  },
  {
    id: "ps-2",
    title: "Vụ án 2: Lừa đảo qua mạng xã hội",
    scenario: "Bị cáo B lập trang Facebook giả mạo tổ chức từ thiện, kêu gọi quyên góp cứu trợ đồng bào lũ lụt và chiếm đoạt tổng số tiền 550 triệu đồng của các nhà hảo tâm. Bị cáo dùng thủ đoạn xảo quyệt, phạm tội nhiều lần.",
    fineRange: { min: 10, max: 100, unit: "triệu VNĐ" },
    prisonRange: { min: 12, max: 20, unit: "năm tù" },
    correctType: "prison",
    correctValue: 15, // frame is 12-20 years
    correctText: "Phạt tù từ 12 đến 20 năm hoặc Tù chung thân (Khoản 4 Điều 174 BLHS 2015)",
    explanation: "Chiếm đoạt tài sản trị giá từ 500 triệu đồng trở lên cấu thành tội lừa đảo chiếm đoạt tài sản ở khung hình phạt cao nhất là Khoản 4 Điều 174 (12-20 năm tù hoặc Chung thân) do hành vi lừa đảo qua mạng chuyên nghiệp."
  },
  {
    id: "ps-3",
    title: "Vụ án 3: Gây rối trật tự công cộng",
    scenario: "Bị cáo C cùng nhóm thanh niên tổ chức đua xe trái phép, lạng lách đánh võng gây tai nạn làm 1 người đi đường bị thương tích 35% và gây ách tắc giao thông nghiêm trọng trong 2 giờ liên tục.",
    fineRange: { min: 10, max: 50, unit: "triệu VNĐ" },
    prisonRange: { min: 2, max: 7, unit: "năm tù" },
    correctType: "prison",
    correctValue: 3, // frame is 2-7 years
    correctText: "Phạt tù từ 2 đến 7 năm (Khoản 2 Điều 318 BLHS 2015)",
    explanation: "Tội gây rối trật tự công cộng thuộc Khoản 2 Điều 318 có khung hình phạt 2-7 năm tù do hành vi tổ chức đua xe trái phép hoặc lạng lách đánh võng gây hậu quả nghiêm trọng."
  }
];

export const PenaltyPredictorGame: React.FC<PenaltyPredictorProps> = ({ onBack, onReward }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [penaltyType, setPenaltyType] = useState<"prison" | "fine">("prison");
  const [selectedValue, setSelectedValue] = useState(3);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const scenario = SCENARIOS[currentIdx];

  const handlePredict = () => {
    if (isAnswered) return;

    setIsAnswered(true);
    let roundScore = 0;

    if (penaltyType === scenario.correctType) {
      // Calculate how close the slider value is to the correct value
      const diff = Math.abs(selectedValue - scenario.correctValue);
      const range = penaltyType === "prison" 
        ? (scenario.prisonRange.max - scenario.prisonRange.min)
        : (scenario.fineRange.max - scenario.fineRange.min);

      const accuracy = Math.max(100 - (diff / range) * 100, 0);
      roundScore = Math.round(accuracy / 3.3); // Max ~30 points per round
      setScore(prev => prev + roundScore);
    } else {
      roundScore = 0; // Wrong penalty type entirely
    }
  };

  const handleNext = () => {
    if (currentIdx >= SCENARIOS.length - 1) {
      setGameOver(true);
      onReward(8, 15);
    } else {
      setCurrentIdx(prev => prev + 1);
      setIsAnswered(false);
      // Reset sliders to mid ranges of the next scenario
      const nextScen = SCENARIOS[currentIdx + 1];
      setPenaltyType(nextScen.correctType === "fine" ? "fine" : "prison");
      setSelectedValue(nextScen.correctType === "fine" ? 20 : 3);
    }
  };

  return (
    <div className="panel lexi-penalty-workspace animate-fade-in">
      {/* Header */}
      <div className="lexi-game-active-header">
        <button className="lexi-btn-exit-game" onClick={onBack}>
          <ArrowLeft size={16} /> Thoát Game
        </button>
        <h3 className="lexi-game-active-title">⚖️ Dự Đoán Khung Hình</h3>
      </div>
      {/* Top Header */}
      <div className="lexi-fraud-top-bar" style={{ marginBottom: "20px" }}>
        <div className="lexi-fraud-progress-text">
          Vụ án {currentIdx + 1} / {SCENARIOS.length}
        </div>
        <div className="lexi-fraud-score">🏆 Tổng điểm: {score}</div>
      </div>

      {gameOver ? (
        <div className="lexi-fraud-game-over animate-scale-up">
          <div className="lexi-fraud-gameover-icon">
            <Award size={56} className="text-emerald" />
          </div>
          <h2>⚖️ ĐÃ PHÁN QUYẾT XONG CÁC VỤ ÁN!</h2>
          <p>Bạn đã hoàn thành phân tích khung hình phạt cho các vụ án hình sự thực tế.</p>
          <div className="lexi-fraud-stats-row">
            <div className="lexi-fraud-stat">
              <strong>{score} / 90</strong>
              <span>Độ Chính Xác</span>
            </div>
            <div className="lexi-fraud-stat">
              <strong>+{8} LC</strong>
              <span>Xu Nhận Được</span>
            </div>
          </div>
          <div className="lexi-outcome-buttons">
            <button className="lexi-btn-outcome-primary" onClick={() => {
              setCurrentIdx(0);
              setScore(0);
              setIsAnswered(false);
              setGameOver(false);
              setPenaltyType("prison");
              setSelectedValue(3);
            }}>
              <RotateCcw size={16} /> Chơi lại
            </button>
            <button className="lexi-btn-outcome-secondary" onClick={onBack}>
              Quay lại Sảnh
            </button>
          </div>
        </div>
      ) : (
        <div className="lexi-penalty-arena">
          
          {/* Scenario Brief card */}
          <div className="lexi-court-case-brief-card" style={{ marginBottom: "24px" }}>
            <h4>{scenario.title}</h4>
            <p className="lexi-brief-description-text" style={{ marginTop: "12px" }}>
              {scenario.scenario}
            </p>
          </div>

          {/* Interactive controls */}
          <div className="panel lexi-shorts-quiz-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--color-glass-border)" }}>
            <h4 style={{ marginBottom: "16px" }}>🎯 Phán đoán loại & mức hình phạt của bạn:</h4>

            {/* Type selector */}
            <div className="flex-row" style={{ gap: "12px", marginBottom: "20px" }}>
              <button 
                className={`lexi-shorts-cat-btn ${penaltyType === "prison" ? "active" : ""}`}
                disabled={isAnswered}
                onClick={() => {
                  setPenaltyType("prison");
                  setSelectedValue(scenario.prisonRange.min);
                }}
              >
                🔒 Phạt tù giam
              </button>
              <button 
                className={`lexi-shorts-cat-btn ${penaltyType === "fine" ? "active" : ""}`}
                disabled={isAnswered}
                onClick={() => {
                  setPenaltyType("fine");
                  setSelectedValue(scenario.fineRange.min);
                }}
              >
                💰 Phạt tiền hành chính
              </button>
            </div>

            {/* Slider */}
            <div className="penalty-slider-control-box" style={{ padding: "10px 0" }}>
              {penaltyType === "prison" ? (
                <>
                  <div className="flex-row justify-between" style={{ marginBottom: "8px" }}>
                    <span>Thời hạn tù:</span>
                    <strong>{selectedValue} năm tù</strong>
                  </div>
                  <input 
                    type="range" 
                    min={scenario.prisonRange.min} 
                    max={scenario.prisonRange.max} 
                    step={1}
                    value={selectedValue} 
                    disabled={isAnswered}
                    onChange={(e) => setSelectedValue(parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--color-primary)" }}
                  />
                  <div className="flex-row justify-between text-muted" style={{ fontSize: "12px", marginTop: "4px" }}>
                    <span>Cận dưới: {scenario.prisonRange.min} năm</span>
                    <span>Cận trên: {scenario.prisonRange.max} năm</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-row justify-between" style={{ marginBottom: "8px" }}>
                    <span>Số tiền phạt:</span>
                    <strong>{selectedValue} triệu VNĐ</strong>
                  </div>
                  <input 
                    type="range" 
                    min={scenario.fineRange.min} 
                    max={scenario.fineRange.max} 
                    step={5}
                    value={selectedValue} 
                    disabled={isAnswered}
                    onChange={(e) => setSelectedValue(parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--color-primary)" }}
                  />
                  <div className="flex-row justify-between text-muted" style={{ fontSize: "12px", marginTop: "4px" }}>
                    <span>Cận dưới: {scenario.fineRange.min} triệu</span>
                    <span>Cận trên: {scenario.fineRange.max} triệu</span>
                  </div>
                </>
              )}
            </div>

            {/* Submit */}
            {!isAnswered ? (
              <button 
                className="lexi-btn-submit-shorts-quiz" 
                style={{ width: "100%", marginTop: "20px" }}
                onClick={handlePredict}
              >
                Xác nhận mức phán quyết
              </button>
            ) : (
              <div className="verdict-outcome-box animate-fade-in" style={{ marginTop: "20px" }}>
                <div className={`lexi-shorts-result-banner ${penaltyType === scenario.correctType ? "success" : "failure"}`} style={{ padding: "16px" }}>
                  <div className="lexi-result-banner-header" style={{ marginBottom: "8px" }}>
                    {penaltyType === scenario.correctType ? (
                      <>
                        <CheckCircle size={16} />
                        <strong>Dự đoán chính xác loại hình phạt!</strong>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} />
                        <strong>Sai loại hình phạt!</strong>
                      </>
                    )}
                  </div>
                  <p><strong>Khung hình phạt chuẩn:</strong> {scenario.correctText}</p>
                  <p style={{ marginTop: "8px", fontSize: "13px" }}><strong>Giải thích pháp lý:</strong> {scenario.explanation}</p>
                </div>

                <button 
                  className="lexi-btn-next-shorts-quiz" 
                  style={{ width: "100%", marginTop: "16px" }}
                  onClick={handleNext}
                >
                  <ChevronRight size={16} /> Vụ án tiếp theo
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
