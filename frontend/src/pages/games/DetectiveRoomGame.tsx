import React, { useState } from "react";
import { 
  Search, 
  Users, 
  FileText, 
  Gavel, 
  HelpCircle, 
  CheckCircle, 
  ArrowRight,
  RotateCcw,
  BookOpen,
  ArrowLeft
} from "lucide-react";

type DetectiveRoomProps = {
  onBack: () => void;
  onReward: (coins: number, xp: number) => void;
};

type CaseInvestigation = {
  title: string;
  brief: string;
  stages: {
    scene: {
      description: string;
      options: { id: string; label: string; clue: string; value: number }[];
    };
    evidence: {
      description: string;
      options: { id: string; name: string; desc: string; isCritical: boolean }[];
    };
    interrogate: {
      description: string;
      suspects: {
        name: string;
        role: string;
        dialogues: { question: string; answer: string; scoreEffect: number }[];
      }[];
    };
    verdict: {
      description: string;
      suspectOptions: string[];
      correctSuspectIndex: number;
      lawOptions: string[];
      correctLawIndex: number;
      explanation: string;
    };
  };
};

const CASE_DATA: CaseInvestigation = {
  title: "Vụ án: Biến thủ công quỹ công ty Fintech Alpha",
  brief: "Vào ngày 20/05/2026, giám đốc tài chính công ty Fintech Alpha báo cáo quỹ tiền mặt của công ty bị thâm hụt mất 800 triệu VND mà không có chứng từ hợp lệ. Hệ thống kế toán tự động bị ngắt kết nối tạm thời trong khoảng từ 1h - 3h sáng cùng ngày.",
  stages: {
    scene: {
      description: "Bạn đã đến hiện trường công ty Alpha. Hãy chọn 1 khu vực để khám nghiệm ưu tiên trước tiên:",
      options: [
        {
          id: "s-1",
          label: "Phòng làm việc của Kế toán trưởng (bà Lan)",
          clue: "Phát hiện sổ tay ghi chép nháp các khoản thu chi ngoài sổ sách, có ghi dòng chữ: 'Gửi vào ví Crypto tối nay 30,000 USD'.",
          value: 30
        },
        {
          id: "s-2",
          label: "Phòng Server IT (quản lý bởi kỹ sư Nam)",
          clue: "Hệ thống ghi nhận log đăng nhập trái phép vào tài khoản Admin của bà Lan lúc 1h45 sáng bằng một địa chỉ IP ảo (VPN).",
          value: 20
        },
        {
          id: "s-3",
          label: "Phòng Giám đốc điều hành (ông Hoàng)",
          clue: "Phòng gọn gàng, không có dấu vết lạ. Tuy nhiên trên bàn có hóa đơn mua căn hộ trả góp đến hạn đóng tiền đợt 2 đúng vào ngày 20/05.",
          value: 15
        }
      ]
    },
    evidence: {
      description: "Có 4 mảnh chứng cứ được gom về phòng hồ sơ. Hãy chọn 2 chứng cứ quan trọng nhất để khởi tố vụ án:",
      options: [
        {
          id: "e-1",
          name: "Sổ tay nháp thu chi ngoài hệ thống",
          desc: "Chứa chữ viết tay của bà Lan trùng khớp với nét chữ ký tá bình thường.",
          isCritical: true
        },
        {
          id: "e-2",
          name: "Lịch sử đăng nhập Server IP ảo",
          desc: "Log đăng nhập lúc 1h45 sáng dùng tài khoản Admin của Kế toán.",
          isCritical: true
        },
        {
          id: "e-3",
          name: "Hóa đơn đóng tiền mua nhà của Giám đốc",
          desc: "Hóa đơn thanh toán ngân hàng giá trị lớn bằng tiền mặt đúng ngày xảy ra sự cố.",
          isCritical: false
        },
        {
          id: "e-4",
          name: "Vỏ chai nước ngọt bỏ lại ở phòng IT",
          desc: "Vỏ chai nước ngọt có chứa dấu vân tay của nhân viên dọn dẹp vệ sinh.",
          isCritical: false
        }
      ]
    },
    interrogate: {
      description: "Nhân chứng & Nghi phạm đang chờ. Hãy chọn hỏi từng người câu hỏi chiến thuật hợp lý nhất:",
      suspects: [
        {
          name: "Bà Lan",
          role: "Kế toán trưởng (Có chữ viết tay trong sổ nháp)",
          dialogues: [
            {
              question: "Bà giải thích thế nào về cuốn sổ tay nháp ghi chuyển tiền Crypto?",
              answer: "“Đó... đó chỉ là tôi ghi chép hộ cho chồng tôi kinh doanh tài sản số cá nhân, hoàn toàn không liên quan công quỹ công ty!” (Bà Lan tỏ ra lúng túng, đổ mồ hôi).",
              scoreEffect: 20
            },
            {
              question: "Mật khẩu hệ thống Admin kế toán có ai biết ngoài bà không?",
              answer: "“Tôi luôn bảo mật kỹ. Tuy nhiên tuần trước tôi có nhờ cậu Nam IT cài lại phần mềm kế toán và có đưa tài khoản để cậu ấy test.”",
              scoreEffect: 15
            }
          ]
        },
        {
          name: "Cậu Nam",
          role: "Kỹ sư IT (Người giữ khóa phòng Server)",
          dialogues: [
            {
              question: "Lúc 1h45 sáng ngày xảy ra vụ việc, cậu đang ở đâu?",
              answer: "“Tôi ở nhà ngủ. Tôi có cài chế độ log tự động báo về điện thoại, nhưng đêm đó máy tôi hết pin nên không biết có truy cập lạ.”",
              scoreEffect: 20
            },
            {
              question: "Cậu có biết tài khoản Admin kế toán của bà Lan không?",
              answer: "“Không, tôi chỉ setup phần mềm thôi, tôi không lưu mật khẩu của bà ấy. Có thể bà ấy bị hack qua mã độc phishing.”",
              scoreEffect: 10
            }
          ]
        }
      ]
    },
    verdict: {
      description: "Dựa vào tất cả các chứng cứ đã thu thập, hãy đưa ra kết luận điều tra cuối cùng của bạn:",
      suspectOptions: [
        "Kế toán trưởng Lan (Cố ý lợi dụng chức vụ để biển thủ quỹ và đổ lỗi cho lỗi bảo mật IT)",
        "Kỹ sư IT Nam (Hack tài khoản Admin để trộm tiền số và đổ tội cho Kế toán)",
        "Giám đốc Hoàng (Chỉ đạo kế toán thực hiện trái quy định để lấy tiền trả góp nhà)"
      ],
      correctSuspectIndex: 0,
      lawOptions: [
        "Điều 174 BLHS: Tội lừa đảo chiếm đoạt tài sản",
        "Điều 353 BLHS: Tội tham ô tài sản (lợi dụng chức vụ, quyền hạn chiếm đoạt tài sản mình quản lý)",
        "Điều 173 BLHS: Tội trộm cắp tài sản"
      ],
      correctLawIndex: 1,
      explanation: "Bà Lan là người quản lý trực tiếp quỹ tiền mặt và tài khoản kế toán, lợi dụng chức danh Kế toán trưởng để chiếm dụng tiền công ty rồi chuyển đổi sang ví điện tử. Hành vi lợi dụng chức vụ chiếm đoạt tài sản được giao quản lý cấu thành tội Tham ô tài sản theo Điều 353 BLHS."
    }
  }
};

export const DetectiveRoomGame: React.FC<DetectiveRoomProps> = ({ onBack, onReward }) => {
  const [stage, setStage] = useState<"brief" | "scene" | "evidence" | "interrogate" | "verdict" | "result">("brief");
  const [accuracy, setAccuracy] = useState(50); // Start at 50%
  const [selectedSceneOption, setSelectedSceneOption] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<Record<string, number>>({}); // suspectName -> dialogueIndex
  const [verdictSuspect, setVerdictSuspect] = useState<number | null>(null);
  const [verdictLaw, setVerdictLaw] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState(0);

  const handleSelectScene = (optId: string) => {
    setSelectedSceneOption(optId);
    const option = CASE_DATA.stages.scene.options.find(o => o.id === optId);
    if (option) {
      setAccuracy(prev => Math.min(prev + option.value, 100));
    }
  };

  const handleSelectEvidence = (id: string) => {
    if (selectedEvidence.includes(id)) {
      setSelectedEvidence(prev => prev.filter(item => item !== id));
    } else {
      if (selectedEvidence.length >= 2) return;
      setSelectedEvidence(prev => [...prev, id]);
    }
  };

  const handleAskQuestion = (suspectName: string, qIdx: number, scoreEffect: number) => {
    setAskedQuestions(prev => ({ ...prev, [suspectName]: qIdx }));
    setAccuracy(prev => Math.min(prev + scoreEffect, 100));
  };

  const checkEvidenceStage = () => {
    // Check how many critical evidence selected
    const criticalSelected = selectedEvidence.filter(id => {
      return CASE_DATA.stages.evidence.options.find(o => o.id === id)?.isCritical;
    }).length;

    setAccuracy(prev => Math.min(prev + (criticalSelected * 15), 100));
    setStage("interrogate");
  };

  const handleTuyenAn = () => {
    if (verdictSuspect === null || verdictLaw === null) return;

    let finalAcc = accuracy;
    if (verdictSuspect === CASE_DATA.stages.verdict.correctSuspectIndex) {
      finalAcc = Math.min(finalAcc + 20, 100);
    } else {
      finalAcc = Math.max(finalAcc - 15, 0);
    }

    if (verdictLaw === CASE_DATA.stages.verdict.correctLawIndex) {
      finalAcc = Math.min(finalAcc + 20, 100);
    } else {
      finalAcc = Math.max(finalAcc - 15, 0);
    }

    setAccuracy(finalAcc);
    setFinalScore(Math.round(finalAcc * 2.5));
    setStage("result");
    
    // Call reward if passed threshold
    if (finalAcc >= 70) {
      onReward(25, 50);
    } else {
      onReward(10, 15);
    }
  };

  return (
    <div className="panel lexi-court-workspace">
      {/* Header */}
      <div className="lexi-game-active-header">
        <button className="lexi-btn-exit-game" onClick={onBack}>
          <ArrowLeft size={16} /> Thoát Game
        </button>
        <h3 className="lexi-game-active-title">🔍 Văn Phòng Thám Tử</h3>
      </div>
      {/* Top trial timeline */}
      <div className="lexi-court-stage-indicators">
        <span className={`court-step ${stage === "brief" || stage === "scene" ? "active" : "done"}`}>
          1. Khám Nghiệm
        </span>
        <span className={`court-step ${stage === "evidence" ? "active" : (stage === "brief" || stage === "scene" ? "" : "done")}`}>
          2. Chứng Cứ
        </span>
        <span className={`court-step ${stage === "interrogate" ? "active" : (stage === "verdict" || stage === "result" ? "done" : "")}`}>
          3. Xét Hỏi
        </span>
        <span className={`court-step ${stage === "verdict" || stage === "result" ? "active" : ""}`}>
          4. Phán Quyết
        </span>
      </div>

      {/* STAGE: BRIEF */}
      {stage === "brief" && (
        <div className="lexi-court-file-room animate-fade-in">
          <div className="lexi-court-card-header">
            <BookOpen size={20} className="text-emerald" />
            <h3>HỒ SƠ KHỞI ĐẦU VỤ ÁN</h3>
          </div>
          <div className="lexi-court-case-brief-card">
            <h4>{CASE_DATA.title}</h4>
            <p className="lexi-brief-description-text" style={{ marginTop: "12px" }}>
              {CASE_DATA.brief}
            </p>
          </div>
          <button className="lexi-btn-court-next" onClick={() => setStage("scene")}>
            BẮT ĐẦU ĐIỀU TRA HIỆN TRƯỜNG »
          </button>
        </div>
      )}

      {/* STAGE: SCENE */}
      {stage === "scene" && (
        <div className="lexi-court-file-room animate-fade-in">
          <div className="lexi-court-card-header">
            <Search size={20} className="text-emerald" />
            <h3>BƯỚC 1: KHÁM NGHIỆM HIỆN TRƯỜNG</h3>
          </div>
          <p className="lexi-verdict-instruction">{CASE_DATA.stages.scene.description}</p>
          
          <div className="lexi-verdict-decisions-list">
            {CASE_DATA.stages.scene.options.map((opt) => (
              <div 
                key={opt.id}
                className={`lexi-verdict-decision-option ${selectedSceneOption === opt.id ? "active" : ""}`}
                onClick={() => handleSelectScene(opt.id)}
              >
                <div className="lexi-decision-radio-bullet"></div>
                <div className="lexi-decision-desc-content">
                  <strong>{opt.label}</strong>
                  {selectedSceneOption === opt.id && (
                    <p className="clue-text animate-fade-in">🔍 Manh mối: {opt.clue}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-row justify-between" style={{ marginTop: "24px" }}>
            <span className="accuracy-badge">Độ chính xác hiện tại: {accuracy}%</span>
            <button 
              className="lexi-btn-court-next" 
              disabled={!selectedSceneOption}
              onClick={() => setStage("evidence")}
            >
              TIẾP THEO: THU THẬP CHỨNG CỨ »
            </button>
          </div>
        </div>
      )}

      {/* STAGE: EVIDENCE */}
      {stage === "evidence" && (
        <div className="lexi-court-file-room animate-fade-in">
          <div className="lexi-court-card-header">
            <FileText size={20} className="text-emerald" />
            <h3>BƯỚC 2: PHÂN TÍCH HỒ SƠ CHỨNG CỨ</h3>
          </div>
          <p className="lexi-verdict-instruction">{CASE_DATA.stages.evidence.description}</p>

          <div className="lexi-matcher-game-grid" style={{ gap: "16px" }}>
            {CASE_DATA.stages.evidence.options.map((opt) => {
              const isSelected = selectedEvidence.includes(opt.id);
              return (
                <div 
                  key={opt.id}
                  className={`lexi-matcher-card ${isSelected ? "selected" : ""}`}
                  style={{ cursor: "pointer", textAlign: "left", padding: "16px" }}
                  onClick={() => handleSelectEvidence(opt.id)}
                >
                  <strong>{opt.name}</strong>
                  <p style={{ fontSize: "13px", marginTop: "8px" }}>{opt.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex-row justify-between" style={{ marginTop: "24px" }}>
            <span className="accuracy-badge">Đã chọn: {selectedEvidence.length}/2 chứng cứ</span>
            <button 
              className="lexi-btn-court-next" 
              disabled={selectedEvidence.length !== 2}
              onClick={checkEvidenceStage}
            >
              TIẾP THEO: XÉT HỎI NGHI PHẠM »
            </button>
          </div>
        </div>
      )}

      {/* STAGE: INTERROGATE */}
      {stage === "interrogate" && (
        <div className="lexi-court-witness-room animate-fade-in">
          <div className="lexi-court-card-header">
            <Users size={20} className="text-emerald" />
            <h3>BƯỚC 3: XÉT HỎI & ĐỐI CHẤT</h3>
          </div>
          <p className="lexi-verdict-instruction">Hãy hỏi các nghi phạm để khai thác thêm thông tin phản biện vụ án:</p>

          <div className="lexi-witness-speeches-grid">
            {CASE_DATA.stages.interrogate.suspects.map((sus, sIdx) => {
              const currentQuestionIndex = askedQuestions[sus.name];
              return (
                <div key={sIdx} className={`lexi-witness-speech-card ${sIdx === 1 ? "enemy" : ""}`}>
                  <div className={`lexi-witness-avatar ${sIdx === 1 ? "en" : "pl"}`}>{sus.name[0]}</div>
                  <div className="lexi-witness-speech-bubble">
                    <strong>{sus.name} ({sus.role}):</strong>
                    
                    {currentQuestionIndex !== undefined ? (
                      <div className="dialogue-flow animate-fade-in">
                        <p className="dialogue-q">❓ HỎI: {sus.dialogues[currentQuestionIndex].question}</p>
                        <p className="dialogue-a">🗣️ ĐÁP: {sus.dialogues[currentQuestionIndex].answer}</p>
                      </div>
                    ) : (
                      <div className="question-triggers" style={{ marginTop: "12px" }}>
                        {sus.dialogues.map((d, dIdx) => (
                          <button
                            key={dIdx}
                            className="lexi-quiz-option-btn"
                            style={{ margin: "4px 0", fontSize: "13px" }}
                            onClick={() => handleAskQuestion(sus.name, dIdx, d.scoreEffect)}
                          >
                            💬 {d.question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex-row justify-between" style={{ marginTop: "24px" }}>
            <span className="accuracy-badge">Độ chính xác hiện tại: {accuracy}%</span>
            <button 
              className="lexi-btn-court-next" 
              disabled={Object.keys(askedQuestions).length < CASE_DATA.stages.interrogate.suspects.length}
              onClick={() => setStage("verdict")}
            >
              TIẾP THEO: TUYÊN ÁN KẾT LUẬN »
            </button>
          </div>
        </div>
      )}

      {/* STAGE: VERDICT */}
      {stage === "verdict" && (
        <div className="lexi-court-verdict-room animate-fade-in">
          <div className="lexi-court-card-header">
            <Gavel size={20} className="text-emerald" />
            <h3>BƯỚC 4: KẾT LUẬN ĐIỀU TRA & TUYÊN ÁN</h3>
          </div>
          <p className="lexi-verdict-instruction">{CASE_DATA.stages.verdict.description}</p>

          <div className="verdict-selection-block" style={{ marginBottom: "20px" }}>
            <h4 style={{ marginBottom: "8px" }}>Nghi phạm chính cấu thành tội phạm:</h4>
            <div className="lexi-verdict-decisions-list">
              {CASE_DATA.stages.verdict.suspectOptions.map((opt, idx) => (
                <div 
                  key={idx}
                  className={`lexi-verdict-decision-option ${verdictSuspect === idx ? "active" : ""}`}
                  onClick={() => setVerdictSuspect(idx)}
                >
                  <div className="lexi-decision-radio-bullet"></div>
                  <div className="lexi-decision-desc-content">
                    <p style={{ margin: 0 }}>{opt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="verdict-selection-block">
            <h4 style={{ marginBottom: "8px" }}>Điều luật áp dụng phù hợp nhất:</h4>
            <div className="lexi-verdict-decisions-list">
              {CASE_DATA.stages.verdict.lawOptions.map((opt, idx) => (
                <div 
                  key={idx}
                  className={`lexi-verdict-decision-option ${verdictLaw === idx ? "active" : ""}`}
                  onClick={() => setVerdictLaw(idx)}
                >
                  <div className="lexi-decision-radio-bullet"></div>
                  <div className="lexi-decision-desc-content">
                    <p style={{ margin: 0 }}>{opt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="lexi-btn-submit-verdict-hammer" 
            disabled={verdictSuspect === null || verdictLaw === null}
            onClick={handleTuyenAn}
            style={{ marginTop: "24px" }}
          >
            🔨 HOÀN TẤT NGHỊ ÁN & TUYÊN ÁN
          </button>
        </div>
      )}

      {/* STAGE: RESULT */}
      {stage === "result" && (
        <div className="lexi-court-complete-screen animate-scale-up shake-screen strike-flash">
          <div className="lexi-verdict-hammer-animation">
            <Gavel size={54} className="gavel-icon-spin" />
          </div>
          <h2>BÁO CÁO KẾT QUẢ ĐIỀU TRA</h2>
          
          <div className="lexi-court-verdict-log">
            <p><strong>Giải thích vụ án:</strong> {CASE_DATA.stages.verdict.explanation}</p>
          </div>

          <div className="lexi-court-verdict-impact-results-box" style={{ marginTop: "20px" }}>
            <h3>ĐIỂM HIỆU SUẤT ĐIỀU TRA:</h3>
            <div className="lexi-verdict-bars-group">
              <div className="lexi-verdict-progress-track-row">
                <span>⚖️ Độ chuẩn xác nghiệp vụ:</span>
                <div className="lexi-verdict-bar-track">
                  <span 
                    className="lexi-verdict-bar-fill" 
                    style={{ 
                      width: `${accuracy}%`,
                      backgroundColor: accuracy >= 80 ? "#10b981" : accuracy >= 50 ? "#f5a623" : "#ef4444"
                    }}
                  ></span>
                </div>
                <strong>{accuracy}%</strong>
              </div>
            </div>
          </div>

          <p className="lexi-court-rewards-notif">
            🎁 Nhận: <strong>+{accuracy >= 70 ? 25 : 10} Lexi Coins</strong> & <strong>+{accuracy >= 70 ? 50 : 15} XP</strong>!
          </p>

          <div className="lexi-outcome-buttons text-center">
            <button className="lexi-btn-outcome-primary" onClick={() => {
              setStage("brief");
              setAccuracy(50);
              setSelectedSceneOption(null);
              setSelectedEvidence([]);
              setAskedQuestions({});
              setVerdictSuspect(null);
              setVerdictLaw(null);
            }}>
              <RotateCcw size={16} /> Chơi lại vụ án này
            </button>
            <button className="lexi-btn-outcome-secondary" onClick={onBack}>
              Quay lại Sảnh
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
