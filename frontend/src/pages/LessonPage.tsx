import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { LessonDetail, QuizSubmission } from "../types/learning";
import { formatDate } from "../utils/format";
import { Button } from "../components/ui/Button";
import { 
  Play, 
  BookOpen, 
  Paperclip, 
  MessageSquare, 
  PenTool, 
  Bookmark, 
  Award, 
  HelpCircle, 
  Send, 
  Download, 
  ChevronRight, 
  Plus, 
  Search, 
  ArrowLeft,
  User,
  Star
} from "lucide-react";

type LessonPageProps = {
  lesson: LessonDetail | null;
  result: QuizSubmission | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onBack: () => void;
};

interface PersonalNote {
  time: string;
  text: string;
}

interface QAThread {
  id: string;
  author: string;
  time: string;
  question: string;
  replier: string;
  reply: string;
  solved: boolean;
}

export function LessonPage({
  lesson,
  result,
  isLoading,
  isSubmitting,
  error,
  onSubmit,
  onBack,
}: LessonPageProps) {
  // Tabs states
  const [activeMenu, setActiveMenu] = useState<string>("noi-dung"); // "noi-dung" | "tai-lieu" | "hoi-dap" | "ghi-chu" | "quiz"
  const [activeRightTab, setActiveRightTab] = useState<string>("ghi-chu"); // "tai-lieu" | "ghi-chu" | "hoi-dap"
  
  // Interactive Notes states
  const [notesList, setNotesList] = useState<PersonalNote[]>([
    {
      time: "03:45",
      text: "Lưu ý về điều khoản bồi thường - chỉ áp dụng khi có thiệt hại thực tế, không tính rủi ro tiềm ẩn.",
    },
    {
      time: "08:40",
      text: "Ví dụ case study: Smith v. Jones. Quan trọng: Phán quyết cuối cùng dựa trên ý định ban đầu.",
    },
    {
      time: "13:08",
      text: "Kiểm tra lại phần ngoại lệ của đặc quyền khi có dấu hiệu lừa đảo (Crime-Fraud Exception).",
    },
  ]);
  const [newNoteText, setNewNoteText] = useState<string>("");

  // Interactive Q&A states
  const [qaList, setQaList] = useState<QAThread[]>([
    {
      id: "1",
      author: "Nguyễn Văn A",
      time: "2 giờ trước",
      question: "Tại sao hợp đồng vô hiệu lại không làm phát sinh quyền và nghĩa vụ?",
      replier: "Trợ lý AI Lexi",
      reply: "Theo Điều 122 BLDS 2015, giao dịch dân sự không có một trong các điều kiện có hiệu lực thì vô hiệu. Khi đó, các bên khôi phục lại tình trạng ban đầu, hoàn trả cho nhau những gì đã nhận.",
      solved: true,
    },
    {
      id: "2",
      author: "Trần Thị B",
      time: "Hôm qua",
      question: "Sự khác biệt giữa lừa dối và nhầm lẫn trong ký kết hợp đồng?",
      replier: "Giảng viên Lê C",
      reply: "Lừa dối là hành vi cố ý làm cho bên kia hiểu sai lệch về chủ thể, tính chất của đối tượng giao dịch hoặc nội dung giao dịch. Còn nhầm lẫn là việc các bên hình dung sai lệch về nội dung giao dịch mà không do sự cố ý của bên nào.",
      solved: false,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newQuestionText, setNewQuestionText] = useState<string>("");
  const [showQuestionInput, setShowQuestionInput] = useState<boolean>(false);

  // Auto-focus tabs based on menu clicks to match Q&A screenshot
  function handleMenuClick(menuKey: string) {
    setActiveMenu(menuKey);
    if (menuKey === "noi-dung") {
      setActiveRightTab("ghi-chu");
    } else if (menuKey === "hoi-dap") {
      setActiveRightTab("hoi-dap");
    } else if (menuKey === "ghi-chu") {
      setActiveRightTab("ghi-chu");
    } else if (menuKey === "tai-lieu") {
      setActiveRightTab("tai-lieu");
    }
  }

  // Handle Note Submission
  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (newNoteText.trim() === "") return;
    
    const newNote: PersonalNote = {
      time: "02:16",
      text: newNoteText.trim(),
    };
    
    setNotesList([...notesList, newNote]);
    setNewNoteText("");
  }

  // Handle Q&A Submission with Mock AI Auto-Response
  function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (newQuestionText.trim() === "") return;

    const newId = String(qaList.length + 1);
    const newThread: QAThread = {
      id: newId,
      author: "Nguyễn Văn A",
      time: "Vừa xong",
      question: newQuestionText.trim(),
      replier: "Trợ lý AI Lexi",
      reply: "Đang phân tích câu hỏi...",
      solved: false,
    };

    setQaList([newThread, ...qaList]);
    setNewQuestionText("");
    setShowQuestionInput(false);

    // Mock AI reply generation
    setTimeout(() => {
      setQaList((prev) => 
        prev.map((item) => 
          item.id === newId 
            ? { 
                ...item, 
                reply: `Cảm ơn câu hỏi pháp lý của bạn! Trợ lý AI Lexi đã ghi nhận. Căn cứ trên nội dung bài học "${lesson?.title ?? "Bài học"}", các trường hợp tranh chấp liên quan sẽ được giải quyết dựa trên quy định tại Bộ luật Dân sự 2015. Bạn có thể đối chiếu thêm với các tài liệu Syllabus đính kèm để làm rõ.`,
                solved: true 
              } 
            : item
        )
      );
    }, 2000);
  }

  // Original Quiz Form Submission
  async function handleQuizSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lesson) return;

    const formData = new FormData(event.currentTarget);
    const answers = Object.fromEntries(
      lesson.questions.map((question) => [
        question.id,
        String(formData.get(question.id) ?? ""),
      ])
    );

    await onSubmit(answers);
  }

  // Filter Q&A Qs
  const filteredQa = qaList.filter((item) => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="lexi-study-root">
      
      {/* breadcrumb bar */}
      <div style={{ maxWidth: "1600px", width: "100%", margin: "16px auto 0", padding: "0 24px" }}>
        <button className="link-button back-button" type="button" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Quay lại Bản đồ</span>
        </button>
      </div>

      {isLoading ? (
        <div className="notice" style={{ justifyContent: "center", padding: "40px" }}>
          <span className="animate-pulse">⚔️ Đang kết nối dữ liệu bài học...</span>
        </div>
      ) : null}
      
      {error ? (
        <div className="error-text" style={{ justifyContent: "center", padding: "20px" }}>
          <span>Lỗi: {error}</span>
        </div>
      ) : null}

      {lesson && (
        <div className="lexi-study-grid">
          
          {/* ==========================================
             1. LEFT SIDEBAR - Navigation & Syllabus
             ========================================== */}
          <aside className="lexi-study-sidebar">
            <div className="lexi-sidebar-course-card">
              <div className="lexi-course-thumb">
                <span>LEGAL<br />101</span>
              </div>
              <div className="lexi-course-meta">
                <span className="lexi-course-title">{lesson.category.title}</span>
                <span className="lexi-course-module">Module 3: Client Privilege</span>
              </div>
            </div>

            <ul className="lexi-sidebar-menu">
              <li>
                <button 
                  className={`lexi-sidebar-menu-btn ${activeMenu === "noi-dung" ? "active" : ""}`}
                  onClick={() => handleMenuClick("noi-dung")}
                >
                  <BookOpen size={16} />
                  <span>Nội dung bài học</span>
                </button>
              </li>
              <li>
                <button 
                  className={`lexi-sidebar-menu-btn ${activeMenu === "tai-lieu" ? "active" : ""}`}
                  onClick={() => handleMenuClick("tai-lieu")}
                >
                  <Paperclip size={16} />
                  <span>Tài liệu</span>
                </button>
              </li>
              <li>
                <button 
                  className={`lexi-sidebar-menu-btn ${activeMenu === "hoi-dap" ? "active" : ""}`}
                  onClick={() => handleMenuClick("hoi-dap")}
                >
                  <MessageSquare size={16} />
                  <span>Hỏi đáp</span>
                </button>
              </li>
              <li>
                <button 
                  className={`lexi-sidebar-menu-btn ${activeMenu === "ghi-chu" ? "active" : ""}`}
                  onClick={() => handleMenuClick("ghi-chu")}
                >
                  <PenTool size={16} />
                  <span>Ghi chú</span>
                </button>
              </li>
              <li>
                <button 
                  className={`lexi-sidebar-menu-btn ${activeMenu === "quiz" ? "active" : ""}`}
                  onClick={() => handleMenuClick("quiz")}
                >
                  <Award size={16} />
                  <span>Đấu Boss Quiz</span>
                </button>
              </li>
            </ul>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                className="lexi-sidebar-btn-syllabus"
                onClick={() => alert("Đang tải giáo trình học tập Syllabus...")}
              >
                Download Syllabus
              </button>
              <a 
                href="#help" 
                style={{ fontSize: "13px", color: "var(--color-muted-text)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                onClick={(e) => { e.preventDefault(); alert("Hỗ trợ kỹ thuật 24/7!"); }}
              >
                <HelpCircle size={14} />
                <span>Help Center</span>
              </a>
            </div>
          </aside>

          {/* ==========================================
             2. CENTER COLUMN - Main content / Video / Quiz
             ========================================== */}
          <main className="lexi-study-main">
            
            {/* View A & B share the breadcrumb & Video */}
            <div className="lexi-breadcrumb">
              {lesson.category.title} <span>&gt;</span> {lesson.module.title} <span>&gt;</span> {activeMenu === "hoi-dap" ? "Bài 2: Hợp đồng dân sự" : lesson.title}
            </div>

            {activeMenu !== "quiz" ? (
              /* LESSON VIEW (Screenshot 1 & 2) */
              <>
                <div className="lexi-video-box">
                  <div className="lexi-video-overlay" onClick={() => alert("Đang phát bài giảng video...")}>
                    <div className="lexi-video-play-btn">
                      <Play size={24} className="fill-white" />
                    </div>
                  </div>
                </div>

                {activeMenu === "hoi-dap" ? (
                  /* Center Panel details for Q&A view (Screenshot 2) */
                  <div style={{ padding: "0 4px" }}>
                    <h2 className="lexi-study-title" style={{ fontSize: "28px", marginBottom: "12px" }}>
                      Bài 2: Các yếu tố làm phát sinh hiệu lực hợp đồng
                    </h2>
                    <p style={{ fontSize: "15px", color: "var(--color-muted-text)", lineHeight: 1.7 }}>
                      Phân tích chi tiết các điều kiện cần và đủ để một hợp đồng dân sự có hiệu lực pháp lý theo Bộ luật Dân sự 2015.
                    </p>
                  </div>
                ) : (
                  /* Center Panel details for Lesson view (Screenshot 1) */
                  <>
                    <h1 className="lexi-study-title">{lesson.title}</h1>
                    <article className="lexi-overview-card">
                      <h4>Tổng quan bài học</h4>
                      <p>{lesson.content}</p>
                      
                      <div className="lexi-overview-badges">
                        <div className="lexi-overview-badge">
                          <Star size={14} className="fill-amber-400 stroke-amber-400" />
                          <span>+50 XP</span>
                        </div>
                        <div className="lexi-overview-badge">
                          <span>⏱️ 15 Phút</span>
                        </div>
                      </div>
                    </article>
                  </>
                )}
              </>
            ) : (
              /* GAMIFIED QUIZ VIEW (Preserving original logic) */
              <div className="lexi-animate-fade">
                <h1 className="lexi-study-title" style={{ fontSize: "28px" }}>⚔️ Boss Battle: {lesson.title}</h1>
                <form className="quiz-form" onSubmit={handleQuizSubmit}>
                  {lesson.questions.map((question, index) => (
                    <fieldset className="panel question-card" key={question.id} style={{ borderLeftColor: "var(--color-primary-green)" }}>
                      <legend style={{ color: "var(--color-dark-slate)", fontWeight: 800 }}>
                        Ải {index + 1}: {question.text}
                      </legend>
                      {question.options.map((option) => (
                        <label className="option-row" key={option.id} style={{ color: "var(--color-dark-slate)", border: "1px solid #eaeaea" }}>
                          <input
                            type="radio"
                            name={question.id}
                            value={option.id}
                            required
                          />
                          {option.text}
                        </label>
                      ))}
                    </fieldset>
                  ))}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !lesson.questions.length}
                    style={{ background: "var(--color-primary-green)" }}
                  >
                    {isSubmitting ? "Đang gửi đáp án..." : "Nộp bài đấu Boss"}
                  </Button>
                </form>
              </div>
            )}

          </main>

          {/* ==========================================
             3. RIGHT COLUMN - Interactive Tabs Panel
             ========================================== */}
          <section className="lexi-study-right">
            
            {/* Tabs selector */}
            <div className="lexi-right-tabs">
              <button 
                className={`lexi-right-tab-btn ${activeRightTab === "tai-lieu" ? "active" : ""}`}
                onClick={() => setActiveRightTab("tai-lieu")}
              >
                Tài liệu
              </button>
              <button 
                className={`lexi-right-tab-btn ${activeRightTab === "ghi-chu" ? "active" : ""}`}
                onClick={() => setActiveRightTab("ghi-chu")}
              >
                Ghi chú cá nhân
              </button>
              <button 
                className={`lexi-right-tab-btn ${activeRightTab === "hoi-dap" ? "active" : ""}`}
                onClick={() => setActiveRightTab("hoi-dap")}
              >
                Hỏi đáp
              </button>
            </div>

            {/* TAB CONTENT A: PERSONAL NOTES (Screenshot 1) */}
            {activeRightTab === "ghi-chu" && (
              <div className="lexi-animate-fade" style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
                <div className="lexi-notes-scroll">
                  {notesList.map((note, idx) => (
                    <div className="lexi-note-bubble" key={idx}>
                      <span className="lexi-note-time">⏱️ {note.time}</span>
                      <p className="lexi-note-text">{note.text}</p>
                    </div>
                  ))}
                </div>

                <div className="lexi-note-input-container">
                  <div style={{ fontSize: "11px", color: "var(--color-primary-green)", fontWeight: 700 }}>
                    Thêm ghi chú tại: ⏱️ 02:16
                  </div>
                  
                  <form onSubmit={handleAddNote} className="lexi-note-input-wrapper">
                    <textarea 
                      placeholder="Nhập ghi chú mới tại đây..." 
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                    />
                    <button className="lexi-note-btn-send" type="submit">
                      <Send size={14} />
                    </button>
                  </form>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "12px" }}>
                    <a 
                      href="#download-notes" 
                      style={{ color: "var(--color-primary-green)", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}
                      onClick={(e) => { e.preventDefault(); alert("Đã xuất ghi chú thành công!"); }}
                    >
                      <Download size={12} />
                      <span>Tải ghi chú</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT B: INTERACTIVE Q&A DISCUSSIONS (Screenshot 2) */}
            {activeRightTab === "hoi-dap" && (
              <div className="lexi-animate-fade" style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>Hỏi đáp & Thảo luận</h4>
                  <span className="lexi-qa-solved-badge" style={{ fontSize: "10px", padding: "4px 8px" }}>24 Câu hỏi</span>
                </div>

                {/* Ask new question trigger */}
                {!showQuestionInput ? (
                  <button 
                    className="lexi-sidebar-btn-syllabus" 
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "16px", minHeight: "38px" }}
                    onClick={() => setShowQuestionInput(true)}
                  >
                    <Plus size={16} />
                    <span>Đặt câu hỏi mới</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddQuestion} style={{ marginBottom: "16px", background: "var(--color-bg-cream)", padding: "12px", borderRadius: "8px" }}>
                    <textarea 
                      placeholder="Đặt câu hỏi pháp lý của bạn tại đây..." 
                      style={{ width: "100%", height: "50px", border: "1px solid #eaeaea", borderRadius: "6px", padding: "8px", fontSize: "12.5px" }}
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      required
                    />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                      <button type="button" className="link-button" style={{ fontSize: "12px", color: "var(--color-muted-text)" }} onClick={() => setShowQuestionInput(false)}>Hủy</button>
                      <button type="submit" className="lexi-sidebar-btn-syllabus" style={{ padding: "4px 12px", width: "auto" }}>Gửi</button>
                    </div>
                  </form>
                )}

                {/* Search questions bar */}
                <div className="lexi-auth-input-wrapper" style={{ marginBottom: "16px" }}>
                  <Search size={14} className="lexi-auth-input-icon" style={{ top: "14px", left: "12px" }} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm câu hỏi..." 
                    style={{ height: "40px", paddingLeft: "36px", borderRadius: "10px", fontSize: "12.5px" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Q&A Threads List */}
                <div className="lexi-qa-scroll">
                  {filteredQa.map((item) => (
                    <div className="lexi-qa-card" key={item.id}>
                      <div className="lexi-qa-user-row">
                        <div className="lexi-qa-avatar">
                          {item.author[0]}
                        </div>
                        <div className="lexi-qa-user-meta">
                          <span className="lexi-qa-username">{item.author}</span>
                          <span className="lexi-qa-time">{item.time}</span>
                        </div>
                      </div>
                      <h4 className="lexi-qa-question-text">{item.question}</h4>
                      
                      <div className="lexi-qa-reply-bubble">
                        <div className="lexi-qa-reply-header">
                          <span className="lexi-qa-replier-name">✨ {item.replier}</span>
                          {item.solved && <span className="lexi-qa-solved-badge">ĐÃ GIẢI QUYẾT</span>}
                        </div>
                        <p className="lexi-qa-reply-text">{item.reply}</p>
                      </div>
                    </div>
                  ))}
                  {!filteredQa.length && (
                    <p className="muted" style={{ textAlign: "center", marginTop: "20px" }}>Chưa có câu hỏi thảo luận nào.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT C: SYLLABUS / DOCUMENTS (Screenshot 1) */}
            {activeRightTab === "tai-lieu" && (
              <div className="lexi-animate-fade">
                <h4 style={{ fontWeight: 800, fontSize: "16px", marginBottom: "16px" }}>Tài liệu đính kèm</h4>
                <ul className="quest-list">
                  <li style={{ background: "none", border: "1px solid #eaeaea", padding: "14px" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>1. Bộ luật Dân sự Việt Nam 2015</strong>
                      <span style={{ fontSize: "11px", color: "var(--color-muted-text)" }}>Tài liệu tham khảo chính | PDF</span>
                    </div>
                    <button className="lexi-note-btn-send" style={{ position: "static", width: "28px", height: "28px" }} onClick={() => alert("Đang tải Bộ luật Dân sự...")}>
                      <Download size={12} />
                    </button>
                  </li>
                  <li style={{ background: "none", border: "1px solid #eaeaea", padding: "14px" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>2. Case Study: Smith v. Jones Summary</strong>
                      <span style={{ fontSize: "11px", color: "var(--color-muted-text)" }}>Tài liệu phân tích vụ án | DOCX</span>
                    </div>
                    <button className="lexi-note-btn-send" style={{ position: "static", width: "28px", height: "28px" }} onClick={() => alert("Đang tải Case Study...")}>
                      <Download size={12} />
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* In-app Original Quiz Results Panel (Preserving original logic) */}
            {activeMenu === "quiz" && result && (
              <section className="panel result-panel lexi-animate-fade" style={{ background: "#ffffff", border: "1px solid #eaeaea", padding: "20px", marginTop: "24px" }}>
                <h2 style={{ fontSize: "20px", border: "none", padding: 0, margin: "0 0 12px" }}>⚔️ Kết quả trận đấu: {result.score}%</h2>
                <p className="muted" style={{ margin: 0 }}>
                  Chính xác: {result.correctCount}/{result.totalQuestions} câu, XP thưởng +{result.xpAwarded}
                </p>
                <ul className="plain-list result-list" style={{ marginTop: "16px", gap: "10px" }}>
                  {result.results.map((item) => {
                    const question = lesson.questions.find((entry) => entry.id === item.questionId);
                    return (
                      <li
                        className={item.isCorrect ? "answer-ok" : "answer-bad"}
                        key={item.questionId}
                        style={{ background: "none", border: "none", padding: "0 0 0 12px" }}
                      >
                        <strong style={{ fontSize: "13px", display: "block" }}>{question?.text ?? item.questionId}</strong>
                        <span style={{ fontSize: "12px", color: "var(--color-muted-text)" }}>
                          {item.isCorrect ? "Đúng" : "Sai"} {item.explanation ? ` - ${item.explanation}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

          </section>

        </div>
      )}
      
      {/* Footer Section */}
      <footer className="lexi-landing-footer" style={{ borderTop: "1px solid #eaeaea", background: "#ffffff", marginTop: "auto", padding: "28px 24px" }}>
        <div className="lexi-landing-footer-container">
          <div className="lexi-footer-logo-block">
            <span className="lexi-footer-logo">LEXI</span>
            <span className="lexi-footer-copy">
              © 2024 LEXI Legal Education. All rights reserved.
            </span>
          </div>
          
          <div className="lexi-footer-links">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Chính sách bảo mật</a>
            <a href="#terms" onClick={(e) => e.preventDefault()}>Điều khoản dịch vụ</a>
            <a href="#support" onClick={(e) => e.preventDefault()}>Liên hệ hỗ trợ</a>
            <a href="#accessibility" onClick={(e) => e.preventDefault()}>Khả năng truy cập</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
export default LessonPage;
