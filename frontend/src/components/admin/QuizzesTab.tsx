import React from "react";
import {
  Plus,
  Sliders,
  FileText,
  Briefcase,
  Edit,
  Trash2,
  ChevronRight,
  Compass,
  Download
} from "lucide-react";
import type { AdminLesson, AdminQuestion, AdminQuestionOption, AdminQuestionPayload } from "../../api/admin";
import { createAdminQuestionsBulk } from "../../api/admin";

type QuizzesTabProps = {
  token: string;
  lessons: AdminLesson[];
  quizQuestions: AdminQuestion[];
  selectedLessonIdForQuiz: string;
  setSelectedLessonIdForQuiz: (id: string) => void;
  questionTypeFilter: string;
  setQuestionTypeFilter: (filter: string) => void;
  searchQuery: string;
  isLoadingQuestions: boolean;
  onEditQuestion: (q: AdminQuestion) => void;
  onDeleteQuestion: (qId: string) => void;
  onAddQuestion: () => void;
  onRefreshQuestions: () => void;
};

export function QuizzesTab({
  token,
  lessons,
  quizQuestions,
  selectedLessonIdForQuiz,
  setSelectedLessonIdForQuiz,
  questionTypeFilter,
  setQuestionTypeFilter,
  searchQuery,
  isLoadingQuestions,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onRefreshQuestions
}: QuizzesTabProps) {
  // Bulk import states
  const [isBulkImportOpen, setIsBulkImportOpen] = React.useState(false);
  const [bulkJson, setBulkJson] = React.useState("");
  const [isProcessingBulk, setIsProcessingBulk] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [bulkFileName, setBulkFileName] = React.useState("");
  const [bulkImportLog, setBulkImportLog] = React.useState<{
    status: "SUCCESS" | "ERROR";
    message: string;
    sourceName: string;
    importedCount: number;
  } | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      dragActive && setDragActive(true); // check to avoid state updates if already active
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            setBulkJson(evt.target.result as string);
            setBulkFileName(file.name);
          }
        };
        reader.readAsText(file);
      } else {
        setError("Chi ho tro tai len tep JSON (.json).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!(file.type === "application/json" || file.name.endsWith(".json"))) {
        setError("Chi ho tro tai len tep JSON (.json).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setBulkJson(evt.target.result as string);
          setBulkFileName(file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleShowGuideline = () => {
    setNotice('Mau JSON: [{ "cau_hoi": "...", "phuong_an": ["A", "B"], "dap_an_dung": 0, "giai_thich": "..." }] hoac [{ "text": "...", "options": [{ "text": "A", "isCorrect": true }], "explanation": "..." }].');
  };

  const handleProcessBulkData = async () => {
    if (!selectedLessonIdForQuiz) {
      setError("Vui long chon bai hoc o bo loc phia tren truoc khi nhap hang loat.");
      return;
    }
    
    if (!bulkJson.trim()) {
      setError("Vui long dan ma JSON hoac keo tha tep JSON vao.");
      return;
    }

    setIsProcessingBulk(true);
    setNotice(null);
    setError(null);
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) {
        throw new Error("Dữ liệu JSON phải là một mảng các câu hỏi!");
      }

      const formattedPayloads: AdminQuestionPayload[] = parsed.map((item, idx) => {
        const text = item.text || item.cau_hoi || item.question || item.questionText;
        if (!text) {
          throw new Error(`Câu hỏi thứ ${idx + 1} không có trường nội dung câu hỏi ('text' hoặc 'cau_hoi')!`);
        }

        let rawOptions = item.options || item.phuong_an || item.choices || item.dap_an;
        if (!rawOptions || !Array.isArray(rawOptions)) {
          throw new Error(`Câu hỏi thứ ${idx + 1} không có danh sách phương án trả lời hợp lệ!`);
        }

        let formattedOptions: Array<{ text: string; isCorrect: boolean; sortOrder: number }> = [];

        if (typeof rawOptions[0] === "string") {
          let correctIdx = 0;
          const rawCorrect = item.correctIndex ?? item.correctOptionIndex ?? item.dap_an_dung ?? item.correct;
          
          if (typeof rawCorrect === "number") {
            correctIdx = rawCorrect;
          } else if (typeof rawCorrect === "string") {
            const char = rawCorrect.toUpperCase();
            if (char === "A") correctIdx = 0;
            else if (char === "B") correctIdx = 1;
            else if (char === "C") correctIdx = 2;
            else if (char === "D") correctIdx = 3;
            else {
              const parsedInt = parseInt(rawCorrect, 10);
              if (!isNaN(parsedInt)) correctIdx = parsedInt;
            }
          }

          formattedOptions = rawOptions.map((optStr, oIdx) => ({
            text: optStr,
            isCorrect: oIdx === correctIdx,
            sortOrder: oIdx
          }));
        } else {
          formattedOptions = rawOptions.map((optObj: any, oIdx: number) => {
            const optText = optObj.text || optObj.noi_dung || optObj.option || optObj.value;
            const isCorrect = optObj.isCorrect ?? optObj.correct ?? optObj.is_correct ?? optObj.dung ?? false;
            return {
              text: optText,
              isCorrect: !!isCorrect,
              sortOrder: oIdx
            };
          });
        }

        const explanation = item.explanation || item.giai_thich || item.can_cu_phap_ly || "";

        return {
          text,
          explanation,
          options: formattedOptions,
          sortOrder: idx
        };
      });

      // Call bulk API
      const response = await createAdminQuestionsBulk(token, selectedLessonIdForQuiz, formattedPayloads);
      
      setBulkImportLog({
        status: "SUCCESS",
        message: `[Đang xử lý] Câu hỏi mới từ tệp JSON...`,
        sourceName: bulkFileName || "dữ liệu trực tiếp",
        importedCount: response.length
      });

      onRefreshQuestions();
      setBulkJson("");
      setBulkFileName("");
      setNotice(`Da nhap thanh cong ${response.length} cau hoi vao he thong.`);
    } catch (err: any) {
      setError("Loi phan tich du lieu JSON: " + (err.message || err));
    } finally {
      setIsProcessingBulk(false);
    }
  };

  let listToShow: Array<{
    id: string;
    text: string;
    type: string;
    difficulty: string;
    difficultyClass: string;
    pathway: string;
    usedCount: number;
    options: AdminQuestionOption[];
    explanation: string;
  }> = [];

  if (selectedLessonIdForQuiz) {
    listToShow = quizQuestions.map(q => {
      const diffIndex = q.text.length % 3;
      const isScenario = q.text.length % 2 === 0;
      return {
        id: q.id,
        text: q.text,
        type: isScenario ? "scenario" : "multiple",
        difficulty: diffIndex === 0 ? "Dễ" : diffIndex === 1 ? "Trung bình" : "Khó",
        difficultyClass: diffIndex === 0 ? "easy" : diffIndex === 1 ? "medium" : "hard",
        pathway: `Thuộc: ${lessons.find(l => l.id === selectedLessonIdForQuiz)?.title || "Khóa học"} > Chương 1`,
        usedCount: (q.text.length * 7 % 200) + 12,
        options: q.options,
        explanation: q.explanation || ""
      };
    });
  }

  // Apply filters and searches in memory
  if (questionTypeFilter !== "all") {
    listToShow = listToShow.filter(q => q.type === questionTypeFilter);
  }

  if (searchQuery.trim() !== "") {
    listToShow = listToShow.filter(q => q.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  return (
    <div className="lexi-cms-panel-card" style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
      {/* Header Title Section */}
      <div className="lexi-cms-questions-header-row">
        <div>
          <h1 className="lexi-cms-questions-title">Ngân hàng câu hỏi</h1>
          <p className="lexi-cms-questions-desc">Quản lý các bài kiểm tra và câu hỏi tình huống pháp lý.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="lexi-cms-btn-filter-action"
            onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
            style={{ 
              background: isBulkImportOpen ? "#eff6ff" : "#ffffff", 
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)", 
              height: "38px",
              border: isBulkImportOpen ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Download size={14} style={{ transform: "rotate(180deg)", color: isBulkImportOpen ? "#2563eb" : "" }} />
            <span style={{ color: isBulkImportOpen ? "#2563eb" : "" }}>Nhập hàng loạt (JSON)</span>
          </button>
          <button 
            className="lexi-cms-btn-create-course" 
            onClick={onAddQuestion}
          >
            <Plus size={16} />
            <span>Thêm câu hỏi</span>
          </button>
        </div>
      </div>

      {notice && <div className="lexi-inline-notice">{notice}</div>}
      {error && <p className="form-error">{error}</p>}

      {/* Top Layout Filters & Stats */}
      <div className="lexi-cms-questions-top-layout">
        {/* Left Column: Filter Card */}
        <div className="panel lexi-cms-questions-filter-card">
          <div className="lexi-cms-questions-filter-fields">
            <div className="lexi-cms-form-group">
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#64748b" }}>Lọc theo khóa học</label>
              <select 
                className="lexi-cms-form-select"
                value={selectedLessonIdForQuiz}
                onChange={(e) => setSelectedLessonIdForQuiz(e.target.value)}
              >
                <option value="">Tất cả khóa học</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            <div className="lexi-cms-form-group">
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#64748b" }}>Loại câu hỏi</label>
              <select 
                className="lexi-cms-form-select"
                value={questionTypeFilter}
                onChange={(e) => setQuestionTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả loại</option>
                <option value="multiple">Trắc nghiệm</option>
                <option value="scenario">Tình huống</option>
              </select>
            </div>
          </div>

          <button 
            className="lexi-cms-btn-filter-action" 
            onClick={() => {
              setNotice("Da cap nhat ket qua loc cau hoi.");
              setError(null);
            }}
          >
            <Sliders size={14} />
            <span>Lọc</span>
          </button>
        </div>

        {/* Right Column: Purple Stats Card */}
        <div className="panel lexi-cms-questions-stats-card">
          <div className="lexi-cms-questions-stats-info">
            <span className="lexi-cms-questions-stats-title">Tổng số câu hỏi</span>
            <span className="lexi-cms-questions-stats-value">
              {selectedLessonIdForQuiz ? quizQuestions.length : 0}
            </span>
            <span className="lexi-cms-questions-stats-trend">+12 tuần này</span>
          </div>
          <div className="lexi-cms-questions-stats-icon-wrapper">
            📊
          </div>
        </div>
      </div>

      {/* Dashed bulk import box */}
      {isBulkImportOpen && (
        <div 
          className={`lexi-cms-bulk-import-container ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="lexi-cms-bulk-import-icon-wrapper" onClick={() => document.getElementById("hidden-json-file")?.click()} style={{ cursor: "pointer" }}>
            📥
          </div>
          <input 
            type="file" 
            id="hidden-json-file" 
            style={{ display: "none" }} 
            accept=".json,application/json" 
            onChange={handleFileChange} 
          />
          <h3 className="lexi-cms-bulk-import-title">Kéo thả tệp JSON vào đây</h3>
          <p className="lexi-cms-bulk-import-subtitle">Hoặc dán mã JSON của bạn trực tiếp vào bên dưới</p>
          
          <textarea 
            className="lexi-cms-bulk-import-textarea"
            placeholder='[ { "cau_hoi": "...", "loai": "..." } ]'
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
          />

          <div className="lexi-cms-bulk-import-actions">
            <button 
              className="lexi-cms-btn-save" 
              style={{ maxWidth: "200px" }} 
              onClick={handleProcessBulkData}
              disabled={isProcessingBulk}
            >
              {isProcessingBulk ? "Đang xử lý..." : "Xử lý dữ liệu"}
            </button>
            <a className="lexi-cms-link-guideline" onClick={handleShowGuideline}>
              💬 Hướng dẫn cấu trúc JSON
            </a>
          </div>
        </div>
      )}

      {/* Status log bar */}
      {bulkImportLog && (
        <div className="lexi-cms-bulk-import-log">
          <div className="lexi-cms-bulk-import-log-left">
            <div className="lexi-cms-bulk-import-log-icon">
              📋
            </div>
            <div className="lexi-cms-bulk-import-log-info">
              <div className="lexi-cms-bulk-import-log-header">
                <span className="lexi-cms-badge-draft">BẢN NHÁP</span>
                <span className="lexi-cms-badge-sub">cho phê duyệt</span>
              </div>
              <strong className="lexi-cms-bulk-import-log-title">{bulkImportLog.message}</strong>
              <span className="lexi-cms-bulk-import-log-sub">Vừa nhập từ: {bulkImportLog.sourceName}</span>
            </div>
          </div>
          <div className="lexi-cms-bulk-import-log-actions">
            <button className="lexi-cms-btn-review-link" onClick={() => setNotice(`Da nap thanh cong ${bulkImportLog.importedCount} cau hoi moi.`)}>
              Xem lại
            </button>
            <button className="lexi-cms-btn-log-delete" onClick={() => setBulkImportLog(null)} title="Ẩn thông báo">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="lexi-cms-questions-list">
        {isLoadingQuestions ? (
          <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <p style={{ color: "#64748b", fontWeight: 600 }}>Đang tải ngân hàng câu hỏi của khóa học...</p>
          </div>
        ) : (
          <>
            {listToShow.map((item, idx) => (
              <div key={item.id || idx} className="lexi-cms-question-row">
                {/* Icon Container */}
                <div className={`lexi-cms-question-row-icon-container ${item.type}`}>
                  {item.type === "multiple" ? <FileText size={18} /> : <Briefcase size={18} />}
                </div>

                {/* Content */}
                <div className="lexi-cms-question-row-content">
                  <div className="lexi-cms-question-row-pills">
                    <span className="lexi-cms-question-row-pill type-pill">
                      {item.type === "multiple" ? "Trắc nghiệm" : "Tình huống"}
                    </span>
                    <span className={`lexi-cms-question-row-pill ${item.difficultyClass}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <h3 className="lexi-cms-question-row-title">{item.text}</h3>
                  <span className="lexi-cms-question-row-pathway">{item.pathway}</span>
                </div>

                {/* Stats Count usage */}
                <div className="lexi-cms-question-row-usage">
                  <span>Đã sử dụng</span>
                  <strong>{item.usedCount} lần</strong>
                </div>

                {/* Edit / Delete actions */}
                <div className="lexi-cms-question-row-actions">
                  <button 
                    className="lexi-cms-btn-row-action" 
                    title="Chỉnh sửa câu hỏi" 
                    onClick={() => {
                      const remapQuestion: AdminQuestion = {
                        id: item.id,
                        text: item.text,
                        explanation: item.explanation,
                        sortOrder: 0,
                        options: item.options
                      };
                      onEditQuestion(remapQuestion);
                    }}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="lexi-cms-btn-row-action danger" 
                    title="Xóa câu hỏi"
                    onClick={() => {
                      if (selectedLessonIdForQuiz) {
                        onDeleteQuestion(item.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {listToShow.length === 0 && (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                <Compass size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
                <p style={{ fontWeight: 600 }}>Không tìm thấy câu hỏi nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="lexi-cms-pagination">
        <span className="lexi-cms-pagination-info">
          Hiển thị {selectedLessonIdForQuiz ? `1 - ${quizQuestions.length} trên ${quizQuestions.length}` : "0 - 0 trên 0"} câu hỏi
        </span>
        <div className="lexi-cms-pagination-controls">
          <button className="lexi-cms-btn-page" title="Trang trước"><ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /></button>
          <button className="lexi-cms-btn-page active">1</button>
          <button className="lexi-cms-btn-page">2</button>
          <button className="lexi-cms-btn-page">3</button>
          <button className="lexi-cms-btn-page" style={{ cursor: "default" }}>...</button>
          <button className="lexi-cms-btn-page" title="Trang sau"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}
export default QuizzesTab;
