import React, { useState, useEffect } from "react";
import { 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Timer,
  BookOpen,
  ArrowRight,
  ArrowLeft
} from "lucide-react";


type LawMatcherProps = {
  onBack: () => void;
  onReward: (coins: number, xp: number) => void;
};

type MatchPair = {
  id: string;
  situation: string;
  law: string;
  explanation: string;
};

const MATCH_PAIRS: MatchPair[] = [
  {
    id: "mp-1",
    situation: "Hành vi tự ý đăng nhập, hack tài khoản Zalo, Facebook của người khác trái phép.",
    law: "Điều 289 BLHS: Tội xâm nhập trái phép mạng máy tính, viễn thông.",
    explanation: "Xâm nhập trái phép tài khoản người khác thông qua hack mật khẩu hoặc các phương thức công nghệ cao để chiếm quyền điều khiển là hành vi vi phạm hình sự."
  },
  {
    id: "mp-2",
    situation: "Sản xuất và rao bán các loại thuốc lá điện tử, thực phẩm chức năng giả trên sàn TMĐT.",
    law: "Điều 194 BLHS: Tội sản xuất, buôn bán hàng giả là lương thực, thực phẩm, thuốc.",
    explanation: "Buôn bán, sản xuất thuốc chữa bệnh, thực phẩm chức năng giả là hành vi xâm phạm sức khỏe cộng đồng cực kỳ nghiêm trọng, cấu thành tội hình sự nặng."
  },
  {
    id: "mp-3",
    situation: "Hành vi đánh đập, bỏ mặc không chăm sóc cha mẹ già yếu trong thời gian dài.",
    law: "Điều 185 BLHS: Tội ngược đãi hoặc hành hạ ông bà, cha mẹ, vợ chồng, con, cháu.",
    explanation: "Ngược đãi hoặc hành hạ thành viên gia đình làm ảnh hưởng đến sức khỏe thể chất, tinh thần của họ sẽ bị phạt cải tạo không giam giữ hoặc phạt tù."
  },
  {
    id: "mp-4",
    situation: "Cho vay tiền qua ứng dụng di động với mức lãi suất lên đến 10%/tháng (120%/năm).",
    law: "Điều 201 BLHS: Tội cho vay lãi nặng trong giao dịch dân sự.",
    explanation: "Bộ luật Dân sự quy định trần lãi suất thỏa thuận không quá 20%/năm. Cho vay với mức lãi suất gấp 5 lần trần này trở lên và thu lợi bất chính là vi phạm hình sự."
  },
  {
    id: "mp-5",
    situation: "Đăng tải bài viết bịa đặt thông tin sai sự thật nhằm bôi nhọ uy tín của một doanh nghiệp.",
    law: "Điều 156 BLHS: Tội vu khống.",
    explanation: "Bịa đặt hoặc lan truyền những điều biết rõ là sai sự thật nhằm xúc phạm nghiêm trọng nhân phẩm, danh dự hoặc gây thiệt hại đến quyền lợi của người khác cấu thành tội vu khống."
  }
];

export const LawMatcherGame: React.FC<LawMatcherProps> = ({ onBack, onReward }) => {
  const [situations, setSituations] = useState<{ id: string; text: string }[]>([]);
  const [laws, setLaws] = useState<{ id: string; text: string }[]>([]);
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // sitId -> lawId
  const [wrongMatch, setWrongMatch] = useState<{ sitId: string; lawId: string } | null>(null);
  const [successMatch, setSuccessMatch] = useState<string | null>(null); // Last matched sitId
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);

  // Initialize and shuffle columns separately
  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, gameOver]);

  const initGame = () => {
    const sitList = MATCH_PAIRS.map(p => ({ id: p.id, text: p.situation }));
    const lawList = MATCH_PAIRS.map(p => ({ id: p.id, text: p.law }));

    // Shuffle helper
    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    setSituations(shuffle(sitList));
    setLaws(shuffle(lawList));
    setMatches({});
    setSelectedSituation(null);
    setSelectedLaw(null);
    setWrongMatch(null);
    setSuccessMatch(null);
    setTimeLeft(90);
    setScore(0);
    setGameOver(false);
    setIsWon(false);
  };

  const handleSelectSituation = (id: string) => {
    if (matches[id] || wrongMatch) return;
    setSelectedSituation(id);
    setSuccessMatch(null);

    // If law already selected, check match
    if (selectedLaw) {
      checkMatch(id, selectedLaw);
    }
  };

  const handleSelectLaw = (id: string) => {
    // Check if this law is already matched
    const isMatched = Object.values(matches).includes(id);
    if (isMatched || wrongMatch) return;
    setSelectedLaw(id);
    setSuccessMatch(null);

    // If situation already selected, check match
    if (selectedSituation) {
      checkMatch(selectedSituation, id);
    }
  };

  const checkMatch = (sitId: string, lawId: string) => {
    if (sitId === lawId) {
      // Correct Match
      const newMatches = { ...matches, [sitId]: lawId };
      setMatches(newMatches);
      setScore((prev) => prev + 20);
      setSuccessMatch(sitId);
      setSelectedSituation(null);
      setSelectedLaw(null);

      // Check if all matched
      if (Object.keys(newMatches).length === MATCH_PAIRS.length) {
        setTimeout(() => {
          setIsWon(true);
          setGameOver(true);
          onReward(12, 25);
        }, 1000);
      }
    } else {
      // Incorrect Match
      setWrongMatch({ sitId, lawId });
      setSelectedSituation(null);
      setSelectedLaw(null);
      setTimeout(() => {
        setWrongMatch(null);
      }, 1200);
    }
  };

  return (
    <div className="panel lexi-law-matcher-workspace">
      {/* Header */}
      <div className="lexi-game-active-header">
        <button className="lexi-btn-exit-game" onClick={onBack}>
          <ArrowLeft size={16} /> Thoát Game
        </button>
        <h3 className="lexi-game-active-title">🧩 Ghép Cặp Pháp Luật</h3>
      </div>
      {/* Top Header */}
      <div className="lexi-fraud-top-bar">
        <div className="lexi-fraud-timer">
          <Timer size={16} />
          <span className={timeLeft <= 15 ? "text-danger animate-pulse" : ""}>{timeLeft}s</span>
        </div>
        <div className="lexi-fraud-progress-text">
          Đã ghép: {Object.keys(matches).length} / {MATCH_PAIRS.length} cặp
        </div>
        <div className="lexi-fraud-score">🏆 {score} điểm</div>
      </div>

      {gameOver ? (
        <div className="lexi-fraud-game-over animate-scale-up">
          <div className="lexi-fraud-gameover-icon">
            {isWon ? <CheckCircle2 size={56} className="text-emerald" /> : <XCircle size={56} className="text-danger" />}
          </div>
          <h2>{isWon ? "🎉 THÀNH CÔNG RỰC RỠ!" : "⏱️ QUÁ THỜI GIAN THỬ THÁCH!"}</h2>
          <p>
            {isWon 
              ? `Bạn đã nối hoàn chỉnh tất cả các cặp tình huống và điều luật!`
              : `Bạn chưa hoàn thành ghép các cặp điều luật đúng hạn. Hãy ôn tập lại nhé!`}
          </p>
          <div className="lexi-fraud-stats-row">
            <div className="lexi-fraud-stat">
              <strong>{score}</strong>
              <span>Điểm Số</span>
            </div>
            <div className="lexi-fraud-stat">
              <strong>{Object.keys(matches).length} / {MATCH_PAIRS.length}</strong>
              <span>Ghép Đúng</span>
            </div>
          </div>
          <div className="lexi-outcome-buttons">
            <button className="lexi-btn-outcome-primary" onClick={initGame}>
              <RotateCcw size={16} /> Thử lại
            </button>
            <button className="lexi-btn-outcome-secondary" onClick={onBack}>
              Quay lại Sảnh
            </button>
          </div>
        </div>
      ) : (
        <div className="lexi-matcher-game-grid">
          
          {/* Situation Column */}
          <div className="lexi-matcher-column">
            <h3>📂 Tình Huống Thực Tế</h3>
            <div className="lexi-matcher-cards-stack">
              {situations.map((sit) => {
                const isMatched = !!matches[sit.id];
                const isSelected = selectedSituation === sit.id;
                const isWrong = wrongMatch?.sitId === sit.id;
                const isJustMatched = successMatch === sit.id;

                let cardClass = "";
                if (isMatched) cardClass = "matched";
                else if (isSelected) cardClass = "selected";
                else if (isWrong) cardClass = "wrong";
                else if (isJustMatched) cardClass = "success-pulse";

                return (
                  <button
                    key={sit.id}
                    className={`lexi-matcher-card sit-card ${cardClass}`}
                    onClick={() => handleSelectSituation(sit.id)}
                    disabled={isMatched}
                  >
                    <p>{sit.text}</p>
                    {isMatched && <span className="matched-badge">✓ Đã ghép</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connect indicator in center */}
          <div className="lexi-matcher-center-bridge">
            <div className="bridge-icon-wrapper">
              <ArrowRight size={24} className="bridge-arrow" />
            </div>
          </div>

          {/* Law Column */}
          <div className="lexi-matcher-column">
            <h3>⚖️ Căn Cứ Điều Luật</h3>
            <div className="lexi-matcher-cards-stack">
              {laws.map((law) => {
                const isMatched = Object.values(matches).includes(law.id);
                const isSelected = selectedLaw === law.id;
                const isWrong = wrongMatch?.lawId === law.id;
                const isJustMatched = successMatch === law.id;
                
                let cardClass = "";
                if (isMatched) cardClass = "matched";
                else if (isSelected) cardClass = "selected";
                else if (isWrong) cardClass = "wrong";
                else if (isJustMatched) cardClass = "success-pulse";

                return (
                  <button
                    key={law.id}
                    className={`lexi-matcher-card law-card ${cardClass}`}
                    onClick={() => handleSelectLaw(law.id)}
                    disabled={isMatched}
                  >
                    <p>{law.text}</p>
                    {isMatched && <span className="matched-badge">✓ Đã ghép</span>}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Explanatory helper box for the last match */}
      {successMatch && (
        <div className="lexi-matcher-explanation-popup animate-fade-in">
          <div className="explain-header">
            <BookOpen size={16} />
            <h4>Giải thích điều luật:</h4>
          </div>
          <p>{MATCH_PAIRS.find(p => p.id === successMatch)?.explanation}</p>
        </div>
      )}
    </div>
  );
};
