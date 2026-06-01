import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { LessonDetail, QuizSubmission } from "../types/learning";
import { formatDate } from "../utils/format";
import { Button } from "../components/ui/Button";
import {
  createLessonDiscussion,
  createLessonNote,
  getLessonDiscussions,
  getLessonNotes,
  type LessonDiscussion,
  type LessonNote,
} from "../api/lessonInteractions";
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
  token: string;
  lesson: LessonDetail | null;
  result: QuizSubmission | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onBack: () => void;
};

interface PersonalNote {
  id: string;
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

function formatInteractionTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
}

function toNoteView(note: LessonNote): PersonalNote {
  const seconds = note.videoTimeSeconds ?? 0;
  const minute = Math.floor(seconds / 60);
  const second = seconds % 60;
  return {
    id: note.id,
    time:
      note.videoTimeSeconds === null
        ? formatInteractionTime(note.createdAt)
        : `${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`,
    text: note.text,
  };
}

function toThreadView(discussion: LessonDiscussion): QAThread {
  const firstReply = discussion.replies[0];
  return {
    id: discussion.id,
    author: discussion.author.fullName,
    time: formatInteractionTime(discussion.createdAt),
    question: discussion.question,
    replier: firstReply?.author.fullName ?? "Chưa có phản hồi",
    reply: firstReply?.body ?? "Câu hỏi đang chờ học viên hoặc cố vấn phản hồi.",
    solved: discussion.isSolved || Boolean(firstReply?.isAccepted),
  };
}

function getAiMentorExplanation(questionText: string) {
  const text = questionText.toLowerCase();
  if (text.includes("thử việc") && text.includes("tối đa")) {
    return "Chính xác! Theo Điều 25 Bộ luật Lao động 2019, thời gian thử việc đối với công việc cần trình độ từ cao đẳng trở lên là không quá 60 ngày. Đây là quy định bắt buộc nhằm tránh việc lạm dụng thử việc kéo dài đối với người lao động có chuyên môn.";
  }
  if (text.includes("lương thử việc")) {
    return "Chính xác! Điều 26 Bộ luật Lao động 2019 quy định tiền lương của người lao động trong thời gian thử việc ít nhất phải bằng 85% mức lương của công việc đó. Mọi thỏa thuận trả lương thử việc dưới 85% đều vi phạm pháp luật.";
  }
  if (text.includes("không trả lương đúng hạn")) {
    return "Chính xác! Điều 35 Bộ luật Lao động 2019 cho phép người lao động có quyền đơn phương chấm dứt hợp đồng lao động ngay lập tức mà không cần báo trước nếu không được trả lương đầy đủ hoặc trả lương đúng thời hạn.";
  }
  if (text.includes("báo trước") && text.includes("nghỉ việc")) {
    return "Chính xác! Thời hạn báo trước khi nghỉ việc đơn phương phụ thuộc chủ yếu vào loại hợp đồng lao động (xác định thời hạn hay không xác định thời hạn) và một số ngành nghề, công việc đặc thù theo quy định pháp luật.";
  }
  if (text.includes("ngày nghỉ hằng năm") || text.includes("nghỉ phép năm")) {
    return "Chính xác! Theo Điều 113 Bộ luật Lao động 2019, người lao động làm việc đủ 12 tháng cho một người sử dụng lao động thì được nghỉ hằng năm hưởng nguyên lương là 12 ngày làm việc trong điều kiện bình thường.";
  }
  if (text.includes("đường đôi có dải phân cách")) {
    return "Chính xác! Theo Thông tư 31/2019/TT-BGTVT, tốc độ tối đa cho phép đối với xe cơ giới tham gia giao thông trong khu đông dân cư trên đường đôi (có dải phân cách giữa) là 60 km/h.";
  }
  if (text.includes("yêu cầu kiểm tra giấy tờ")) {
    return "Chính xác! Khi có hiệu lệnh kiểm tra của lực lượng chức năng, người lái xe cần giữ bình tĩnh, chấp hành hiệu lệnh, xuất trình đúng và đầy đủ các giấy tờ hợp lệ và hợp tác làm việc một cách văn minh, đúng mực.";
  }
  if (text.includes("link phishing") || (text.includes("dấu hiệu") && text.includes("phishing"))) {
    return "Chính xác! Các đường link phishing (lừa đảo) thường sử dụng chiêu trò tạo tâm lý khẩn cấp (như đe dọa khóa thẻ, khóa tài khoản) để đánh lừa nạn nhân nhanh chóng cung cấp thông tin đăng nhập, mã pin hoặc OTP.";
  }
  if (text.includes("nghi ngờ link ngân hàng")) {
    return "Chính xác! Khi nghi ngờ một đường link, tuyệt đối không được click hay nhập thông tin. Hãy truy cập trực tiếp vào ứng dụng chính thức của ngân hàng hoặc gọi lên hotline chính thống để xác minh thông tin.";
  }
  if (text.includes("otp") && text.includes("chia sẻ")) {
    return "Chính xác! OTP (One-Time Password) là mật khẩu sử dụng một lần và là chốt chặn bảo mật cuối cùng cho tài sản của bạn. Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả người tự xưng là nhân viên ngân hàng hay công an.";
  }
  if (text.includes("lộ mật khẩu")) {
    return "Chính xác! Đổi mật khẩu ngay lập tức sang một chuỗi ký tự phức tạp và thực hiện đăng xuất tài khoản khỏi tất cả các thiết bị lạ là hành động khẩn cấp và hiệu quả nhất để ngăn chặn kẻ gian chiếm đoạt tài khoản.";
  }
  if (text.includes("lời mời đầu tư") || text.includes("app đầu tư")) {
    return "Chính xác! Những lời hứa cam kết lợi nhuận cao mà chắc chắn 100% không rủi ro là dấu hiệu điển hình của mô hình lừa đảo Ponzi hoặc lừa đảo qua app giả mạo. Đầu tư hợp pháp luôn đi kèm với rủi ro tương ứng.";
  }
  if (text.includes("nộp tiền vào app") || text.includes("trước khi nạp")) {
    return "Chính xác! Việc tra cứu pháp nhân, giấy phép hoạt động của công ty tài chính từ Ủy ban Chứng khoán hoặc các cơ quan nhà nước có thẩm quyền là bước bắt buộc để tự bảo vệ tài sản của mình trước khi đầu tư.";
  }
  if (text.includes("đặt cọc gấp")) {
    return "Chính xác! Yêu cầu đặt cọc khẩn cấp là chiêu bài ép tâm lý của kẻ lừa đảo. Bạn cần tỉnh táo, kiểm tra thông tin người bán và luôn giữ lại biên lai chuyển khoản cùng các tin nhắn thỏa thuận làm bằng chứng pháp lý.";
  }
  if (text.includes("bằng chứng") && text.includes("lừa mua hàng")) {
    return "Chính xác! Các ảnh chụp màn hình tin nhắn thỏa thuận, thông tin số tài khoản nhận tiền, biên lai chuyển khoản ngân hàng và bài đăng gốc của đối tượng lừa đảo là những bằng chứng thép để gửi cơ quan điều tra.";
  }
  if (text.includes("bằng chứng") && text.includes("mua hàng online")) {
    return "Chính xác! Lưu trữ hóa đơn điện tử, video mở hộp (unboxing) nguyên đai nguyên kiện và tin nhắn chốt đơn là thói quen thông minh giúp bảo vệ quyền lợi người tiêu dùng tối đa khi hàng hóa xảy ra lỗi hoặc sai mô tả.";
  }
  if (text.includes("không đúng mô tả")) {
    return "Chính xác! Đầu tiên, hãy liên hệ ngay bộ phận hỗ trợ khách hàng của shop hoặc sàn TMĐT, cung cấp bằng chứng rõ ràng (video mở hàng, ảnh lỗi) để được giải quyết đổi trả theo đúng chính sách bảo vệ người tiêu dùng.";
  }
  if (text.includes("yêu cầu bảo hành")) {
    return "Chính xác! Hóa đơn mua hàng hợp lệ cùng phiếu bảo hành gốc là điều kiện cần thiết để kích hoạt quyền lợi bảo hành chính hãng. Việc chuẩn bị đầy đủ các giấy tờ này giúp hãng tiếp nhận và xử lý bảo hành cực kỳ nhanh chóng.";
  }
  if (text.includes("luật sư a đại diện") || text.includes("tình huống tiến thoái")) {
    return "Chính xác! Bạn đã hiểu rõ ngoại lệ của quy tắc bảo mật. Mặc dù thông tin giữa luật sư và thân chủ là tuyệt mật, nhưng khi có nguy cơ đe dọa đến tính mạng, sức khỏe, hoặc thiệt hại tài sản nghiêm trọng do hành vi phạm tội có chủ ý trong tương lai, luật sư có nghĩa vụ phải tiết lộ thông tin đó để ngăn chặn.";
  }
  return "Chính xác! Lựa chọn của bạn hoàn toàn chính xác và tuân thủ đúng các nguyên tắc đạo đức nghề nghiệp cũng như quy định của pháp luật hiện hành. Việc áp dụng đúng quy tắc giúp bảo vệ quyền lợi hợp pháp một cách bền vững.";
}

function getQuestionCustomTitle(questionIndex: number) {
  const index = questionIndex + 1;
  if (index === 1) return "Tình huống bảo mật thông tin";
  if (index === 2) return "Xung đột lợi ích khách hàng";
  if (index === 3) return "Tình huống tiến thoái lưỡng nan";
  if (index === 4) return "Trách nhiệm xã hội của Luật sư";
  if (index === 5) return "Đại diện pháp lý song phương";
  return `Tình huống thực tế pháp lý số ${index}`;
}

export function LessonPage({
  token,
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
  const [notesList, setNotesList] = useState<PersonalNote[]>([]);
    const [newNoteText, setNewNoteText] = useState<string>("");

  // Interactive Q&A states
  const [qaList, setQaList] = useState<QAThread[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
  const [newQuestionText, setNewQuestionText] = useState<string>("");
  const [showQuestionInput, setShowQuestionInput] = useState<boolean>(false);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Quiz Wizard states
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes
  const [showResult, setShowResult] = useState<boolean>(false);

  // Sync showResult with result prop
  useEffect(() => {
    if (result) {
      setShowResult(true);
    } else {
      setShowResult(false);
    }
  }, [result]);

  useEffect(() => {
    if (activeMenu !== "quiz" || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMenu, showResult]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!lesson) return;

    const currentLesson = lesson;
    let ignore = false;
    async function loadInteractions() {
      setInteractionError(null);
      try {
        const [notes, discussions] = await Promise.all([
          getLessonNotes(token, currentLesson.id),
          getLessonDiscussions(token, currentLesson.id),
        ]);
        if (ignore) return;
        setNotesList(notes.items.map(toNoteView));
        setQaList(discussions.items.map(toThreadView));
      } catch (err) {
        if (!ignore) {
          setInteractionError(
            err instanceof Error ? err.message : "Không thể tải tương tác bài học"
          );
        }
      }
    }

    void loadInteractions();
    return () => {
      ignore = true;
    };
  }, [lesson?.id, token]);

  // Auto-focus tabs based on menu clicks to match Q&A screenshot
  function handleMenuClick(menuKey: string) {
    setActiveMenu(menuKey);
    setActionNotice(null);
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

  function handleUnavailableFeature(featureName: string) {
    setActionNotice(`Tính năng ${featureName} chưa được kết nối trong bản thử nghiệm này.`);
  }

  function handleOpenVideo() {
    if (lesson?.videoUrl) {
      window.open(lesson.videoUrl, "_blank", "noopener,noreferrer");
      return;
    }

    handleUnavailableFeature("Video bài học");
  }

  function handleOpenSourceDocument() {
    if (lesson?.sourceUrl) {
      window.open(lesson.sourceUrl, "_blank", "noopener,noreferrer");
      return;
    }

    handleUnavailableFeature("Tải tài liệu nguồn");
  }

  function handleDownloadNotes(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (!lesson) return;

    if (notesList.length === 0) {
      setActionNotice("There are no notes to export yet.");
      return;
    }

    const content = [
      `LEXI lesson notes`,
      `Lesson: ${lesson.title}`,
      `Exported at: ${new Date().toISOString()}`,
      "",
      ...notesList.map((note, index) => `${index + 1}. [${note.time}] ${note.text}`),
      "",
      "Note: LEXI content is for general legal learning and reference only.",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeTitle = lesson.slug || lesson.id;
    anchor.href = url;
    anchor.download = `lexi-notes-${safeTitle}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setActionNotice("Notes exported as a text file.");
  }

  // Handle Note Submission
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!lesson || newNoteText.trim() === "") return;

    setInteractionError(null);
    try {
      const note = await createLessonNote(token, lesson.id, {
        text: newNoteText.trim(),
      });
      setNotesList((items) => [toNoteView(note), ...items]);
      setNewNoteText("");
      setActionNotice("Đã lưu ghi chú.");
    } catch (err) {
      setInteractionError(
        err instanceof Error ? err.message : "Không thể lưu ghi chú"
      );
    }
  }

  // Handle Q&A Submission
  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!lesson || newQuestionText.trim() === "") return;

    setInteractionError(null);
    try {
      const discussion = await createLessonDiscussion(token, lesson.id, {
        question: newQuestionText.trim(),
      });
      setQaList((items) => [toThreadView(discussion), ...items]);
      setNewQuestionText("");
      setShowQuestionInput(false);
      setActionNotice("Đã gửi câu hỏi.");
    } catch (err) {
      setInteractionError(
        err instanceof Error ? err.message : "Không thể đăng câu hỏi"
      );
    }
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

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  async function handleQuizWizardSubmit() {
    if (!lesson) return;
    await onSubmit(answers);
  }

  // Filter Q&A Qs
  const filteredQa = qaList.filter((item) => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeMenu === "quiz" && lesson) {
    const totalQuestions = lesson.questions.length;
    const currentQuestion = lesson.questions[currentQuizIndex];

    if (showResult && result) {
      const strokeColor = result.score >= 80 ? "#10b981" : result.score >= 50 ? "#f59e0b" : "#ef4444";
      const scorePercentage = Math.round(result.score);
      const bgGradient = `conic-gradient(${strokeColor} ${scorePercentage}%, #f1f5f9 ${scorePercentage}%)`;

      return (
        <div className="lexi-quiz-isolated-root" style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#ffffff",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          color: "#1e293b",
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          overflow: "hidden"
        }}>
          {/* Header */}
          <header style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "72px",
            padding: "0 40px",
            borderBottom: "1px solid #e2e8f0",
            background: "#ffffff"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <button 
                onClick={() => setActiveMenu("noi-dung")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "22px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                  borderRadius: "50%",
                  transition: "all 0.2s ease"
                }}
                title="Quay lại bài giảng"
              >
                ✕
              </button>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b" }}>
                  Kết quả bài kiểm tra
                </span>
                <span style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                  {lesson.category.title}: {lesson.title}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                background: result.score >= 80 ? "#d1fae5" : "#fee2e2",
                color: result.score >= 80 ? "#065f46" : "#991b1b",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span>{result.score >= 80 ? "✓ Hoàn thành" : "✕ Chưa đạt"}</span>
              </div>
              <div style={{
                background: "#f0fdf4",
                color: "#166534",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700
              }}>
                +{result.xpAwarded} XP
              </div>
              <div style={{
                background: "#fffbeb",
                color: "#92400e",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700
              }}>
                +{result.coinsAwarded ?? 0} LC
              </div>
            </div>
          </header>

          {/* Split Content */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Left: Summary Chart */}
            <div style={{
              width: "38%",
              padding: "48px 40px",
              background: "#fafafb",
              borderRight: "1px solid #e2e8f0",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              {/* Circular Gauge */}
              <div style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: bgGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                marginBottom: "32px",
                position: "relative"
              }}>
                <div style={{
                  width: "152px",
                  height: "152px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <span style={{ fontSize: "40px", fontWeight: 900, color: "#1e293b", letterSpacing: "-1px" }}>
                    {scorePercentage}%
                  </span>
                  <span style={{ fontSize: "11px", color: strokeColor, fontWeight: 800, letterSpacing: "1.5px", marginTop: "4px", textTransform: "uppercase" }}>
                    {result.score >= 80 ? "ĐẠT YÊU CẦU" : "CHƯA ĐẠT"}
                  </span>
                </div>
              </div>

              {/* Stat Grid */}
              <div style={{
                width: "100%",
                maxWidth: "320px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "36px"
              }}>
                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Số câu đúng</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", marginTop: "4px" }}>
                    {result.correctCount}/{result.totalQuestions}
                  </div>
                </div>
                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Điểm đạt được</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", marginTop: "4px" }}>
                    {scorePercentage}/100
                  </div>
                </div>
              </div>

              {/* Motivational message */}
              <div style={{
                background: "#eff6ff",
                border: "1px solid #dbeafe",
                borderRadius: "12px",
                padding: "20px",
                maxWidth: "340px",
                marginBottom: "40px",
                textAlign: "center"
              }}>
                <p style={{ fontSize: "14.5px", color: "#1e3a8a", lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {result.score >= 80
                    ? "Xuất sắc! Bạn đã hoàn thành bài kiểm tra trắc nghiệm với điểm số ấn tượng. Hãy tiếp tục phát huy tinh thần học tập này ở các bài học tiếp theo!"
                    : result.score >= 50
                    ? "Bài làm đạt yêu cầu! Bạn đã nắm được phần lớn nội dung. Hãy tham khảo phần phân tích chi tiết của AI Mentor bên phải để rút kinh nghiệm cho các câu trả lời chưa đúng."
                    : "Chưa đạt yêu cầu! Hãy dành thêm thời gian ôn tập kỹ tài liệu bài học và thử sức lại với bài trắc nghiệm để củng cố vững chắc kiến thức của mình."
                  }
                </p>
              </div>

              {/* Buttons */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
                maxWidth: "320px",
                marginTop: "auto"
              }}>
                <button
                  onClick={() => setActiveMenu("noi-dung")}
                  style={{
                    background: "#4f46e5",
                    color: "#ffffff",
                    border: "none",
                    height: "48px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  Quay lại bài giảng
                </button>
                <button
                  onClick={() => {
                    setAnswers({});
                    setCurrentQuizIndex(0);
                    setTimeLeft(15 * 60);
                    setShowResult(false);
                  }}
                  style={{
                    background: "transparent",
                    color: "#4f46e5",
                    border: "2px solid #4f46e5",
                    height: "48px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  Làm lại Quiz
                </button>
              </div>
            </div>

            {/* Right: Review List */}
            <div style={{
              flex: 1,
              padding: "48px 60px",
              overflowY: "auto",
              background: "#ffffff"
            }}>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", marginBottom: "24px" }}>
                Xem lại chi tiết bài làm
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {result.results.map((item, index) => {
                  const question = lesson.questions.find((q) => q.id === item.questionId);
                  if (!question) return null;

                  return (
                    <div key={item.questionId} style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "24px",
                      background: "#ffffff",
                      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)"
                    }}>
                      {/* Question Index & Text */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                        <div style={{
                          background: item.isCorrect ? "#e6f4ea" : "#fce8e6",
                          color: item.isCorrect ? "#137333" : "#c5221f",
                          minWidth: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "13px",
                          marginTop: "2px"
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                            {getQuestionCustomTitle(index)}
                          </div>
                          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0, lineHeight: 1.5 }}>
                            {question.text}
                          </h3>
                        </div>
                      </div>

                      {/* Options Review */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                        {question.options.map((option) => {
                          const isSelectedByUser = item.selectedOptionId === option.id;
                          const isCorrectOption = option.id === item.correctOptionId || (item.isCorrect && isSelectedByUser);
                          
                          let cardBorder = "1px solid #cbd5e1";
                          let cardBg = "#ffffff";
                          let dotColor = "#cbd5e1";
                          let textColor = "#334155";
                          let statusMarker = null;

                          if (isCorrectOption) {
                            cardBorder = "2px solid #22c55e";
                            cardBg = "#f0fdf4";
                            dotColor = "#22c55e";
                            textColor = "#15803d";
                            statusMarker = <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 800, color: "#22c55e", textTransform: "uppercase" }}>Đáp án đúng</span>;
                          } else if (isSelectedByUser && !item.isCorrect) {
                            cardBorder = "2px solid #ef4444";
                            cardBg = "#fef2f2";
                            dotColor = "#ef4444";
                            textColor = "#991b1b";
                            statusMarker = <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 800, color: "#ef4444", textTransform: "uppercase" }}>Lựa chọn của bạn</span>;
                          }

                          return (
                            <div key={option.id} style={{
                              border: cardBorder,
                              background: cardBg,
                              padding: "12px 16px",
                              borderRadius: "8px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: "14px",
                              fontWeight: isSelectedByUser || isCorrectOption ? 600 : 500,
                              color: textColor
                            }}>
                              <div style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                border: `2px solid ${dotColor}`,
                                background: isCorrectOption || (isSelectedByUser && !item.isCorrect) ? dotColor : "#ffffff",
                                marginRight: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: "bold"
                              }}>
                                {isCorrectOption ? "✓" : isSelectedByUser ? "✕" : ""}
                              </div>
                              <span>{option.text}</span>
                              {statusMarker}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "8px",
                        padding: "16px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "14px" }}>✨</span>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#2563eb", letterSpacing: "1px", textTransform: "uppercase" }}>
                            AI Mentor phân tích
                          </span>
                        </div>
                        <p style={{ fontSize: "13.5px", color: "#1e293b", lineHeight: 1.6, margin: 0 }}>
                          {item.explanation || getAiMentorExplanation(question.text)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Fullscreen compact & neat Quiz Questions Screen
      const currentCustomTitle = getQuestionCustomTitle(currentQuizIndex);
      const hasSelected = Boolean(answers[currentQuestion.id]);

      return (
        <div className="lexi-quiz-isolated-root" style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "#ffffff",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          color: "#1e293b",
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          overflow: "hidden"
        }}>
          {/* Header Bar */}
          <header style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "72px",
            padding: "0 40px",
            borderBottom: "1px solid #e2e8f0",
            background: "#ffffff"
          }}>
            {/* Left Close & Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <button 
                onClick={() => setActiveMenu("noi-dung")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "22px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                  borderRadius: "50%",
                  transition: "all 0.2s ease"
                }}
                title="Quay lại bài học"
              >
                ✕
              </button>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b" }}>
                  Bài kiểm tra trắc nghiệm
                </span>
                <span style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                  {lesson.category.title}: {lesson.title}
                </span>
              </div>
            </div>

            {/* Right Progress & Timer */}
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Tiến độ</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#4f46e5", marginTop: "2px" }}>
                  {currentQuizIndex + 1}/{totalQuestions}
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#f1f5f9",
                padding: "8px 16px",
                borderRadius: "8px",
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "14px"
              }}>
                <span>⏱️</span>
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </header>

          {/* Main Work Area */}
          <div style={{
            display: "flex",
            flex: 1,
            overflow: "hidden"
          }}>
            {/* Center/Left Content: Question & Options */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "32px 64px 48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <div style={{ width: "100%", maxWidth: "760px" }}>
                
                {/* Question Headline */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{
                    background: "#4f46e5",
                    color: "#ffffff",
                    minWidth: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "16px"
                  }}>
                    {currentQuizIndex + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>
                      {currentCustomTitle}
                    </div>
                    <h2 style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#1e293b",
                      margin: 0,
                      lineHeight: 1.3
                    }}>
                      {currentQuestion.text.includes("\n") 
                        ? currentQuestion.text.split("\n")[currentQuestion.text.split("\n").length - 1]
                        : "Hãy chọn phương án xử lý phù hợp nhất:"}
                    </h2>
                  </div>
                </div>

                {currentQuestion ? (
                  <>
                    {/* Scenario text Box */}
                    <div style={{
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: "12px",
                      padding: "20px 24px",
                      color: "#334155",
                      fontSize: "15px",
                      lineHeight: 1.6,
                      marginBottom: "24px"
                    }}>
                      {currentQuestion.text.split("\n").map((line, idx) => {
                        // Avoid repeating the last line if it is already displayed in the header
                        if (currentQuestion.text.includes("\n") && idx === currentQuestion.text.split("\n").length - 1) return null;
                        return (
                          <p key={idx} style={{ margin: idx > 0 ? "10px 0 0" : 0 }}>
                            {line}
                          </p>
                        );
                      })}
                    </div>

                    {/* Options List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                      {currentQuestion.options.map((option) => {
                        const isSelected = answers[currentQuestion.id] === option.id;
                        return (
                          <div
                            key={option.id}
                            onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                            style={{
                              border: isSelected ? "2px solid #22c55e" : "1px solid #cbd5e1",
                              background: isSelected ? "#f0fdf4" : "#ffffff",
                              padding: "14px 20px",
                              borderRadius: "12px",
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                          >
                            {/* Radio Check Circle */}
                            <div style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              border: isSelected ? "none" : "2px solid #cbd5e1",
                              background: isSelected ? "#22c55e" : "#ffffff",
                              marginRight: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}>
                              {isSelected ? "✓" : ""}
                            </div>
                            <span style={{
                              fontSize: "14.5px",
                              color: isSelected ? "#15803d" : "#334155",
                              fontWeight: isSelected ? 600 : 500,
                              lineHeight: 1.4
                            }}>
                              {option.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Mentor Card */}
                    {answers[currentQuestion.id] && (
                      <div style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        marginBottom: "28px",
                        animation: "fadeIn 0.3s ease-out"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                          <span style={{ fontSize: "16px" }}>✨</span>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: "#2563eb", letterSpacing: "1px", textTransform: "uppercase" }}>
                            AI MENTOR PHÂN TÍCH
                          </span>
                        </div>
                        <p style={{ fontSize: "13.5px", color: "#1e293b", lineHeight: 1.6, margin: 0 }}>
                          {getAiMentorExplanation(currentQuestion.text)}
                        </p>
                      </div>
                    )}

                    {/* Footer Continue Button */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                      {currentQuizIndex < totalQuestions - 1 ? (
                        <button
                          onClick={() => setCurrentQuizIndex((prev) => prev + 1)}
                          disabled={!answers[currentQuestion.id]}
                          style={{
                            background: answers[currentQuestion.id] ? "#4f46e5" : "#a5b4fc",
                            color: "#ffffff",
                            border: "none",
                            padding: "12px 28px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "14.5px",
                            cursor: answers[currentQuestion.id] ? "pointer" : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <span>Tiếp tục</span>
                          <span>→</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleQuizWizardSubmit}
                          disabled={isSubmitting || !answers[currentQuestion.id]}
                          style={{
                            background: answers[currentQuestion.id] ? "#22c55e" : "#86efac",
                            color: "#ffffff",
                            border: "none",
                            padding: "12px 32px",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "14.5px",
                            cursor: answers[currentQuestion.id] ? "pointer" : "not-allowed",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {isSubmitting ? "Đang gửi..." : "Nộp bài làm"}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Không có câu hỏi trong bài kiểm tra này.
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Circular Question Bubbles Navigation */}
            <div style={{
              width: "80px",
              borderLeft: "1px solid #e2e8f0",
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "32px 0",
              overflowY: "auto",
              position: "relative"
            }}>
              {/* Slim Connecting Line */}
              <div style={{
                position: "absolute",
                top: "48px",
                bottom: "48px",
                width: "2px",
                background: "#e2e8f0",
                zIndex: 1
              }}></div>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", zIndex: 2 }}>
                {Array.from({ length: totalQuestions }).map((_, idx) => {
                  const isCurrent = currentQuizIndex === idx;
                  const isAnswered = Boolean(answers[lesson.questions[idx]?.id]);
                  
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => setCurrentQuizIndex(idx)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          border: isCurrent ? "2px solid #4f46e5" : "none",
                          background: isCurrent ? "#4f46e5" : isAnswered ? "#e0e7ff" : "#f1f5f9",
                          color: isCurrent ? "#ffffff" : isAnswered ? "#4f46e5" : "#64748b",
                          fontWeight: 700,
                          fontSize: "14px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                          outline: "none",
                          boxShadow: isCurrent ? "0 4px 10px rgba(79, 70, 229, 0.3)" : "none"
                        }}
                      >
                        {idx + 1}
                      </button>
                      {isAnswered && (
                        <div style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#22c55e",
                          boxShadow: "0 0 4px rgba(34, 197, 94, 0.5)"
                        }}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

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

      {interactionError ? (
        <div className="error-text" style={{ justifyContent: "center", padding: "12px" }}>
          <span>{interactionError}</span>
        </div>
      ) : null}
      {actionNotice ? (
        <div className="lexi-inline-notice" style={{ justifyContent: "center", margin: "12px auto 0", maxWidth: "920px" }}>
          <span>{actionNotice}</span>
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
                  <span>Làm bài Quiz</span>
                </button>
              </li>
            </ul>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                className="lexi-sidebar-btn-syllabus"
                onClick={handleOpenSourceDocument}
              >
                Tải đề cương bài học
              </button>
              <a 
                href="#help" 
                style={{ fontSize: "13px", color: "var(--color-muted-text)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                onClick={(e) => {
                  e.preventDefault();
                  handleUnavailableFeature("Trung tâm trợ giúp");
                }}
              >
                <HelpCircle size={14} />
                <span>Trung tâm Trợ giúp</span>
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
                  <div className="lexi-video-overlay" onClick={handleOpenVideo}>
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
              /* GAMIFIED QUIZ VIEW - STEP BY STEP WIZARD */
              <div className="lexi-animate-fade" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <h1 className="lexi-study-title" style={{ fontSize: "28px", marginBottom: "8px" }}>Bài kiểm tra trắc nghiệm: {lesson.title}</h1>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>Hãy hoàn thành các câu hỏi dưới đây để nộp bài làm.</p>
                </div>

                {lesson.questions.length > 0 && lesson.questions[currentQuizIndex] ? (
                  <div className="panel question-card" style={{ borderLeft: "4px solid var(--color-primary)", padding: "24px 28px", background: "var(--color-glass-card)" }}>
                    {/* Glowing Progress Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--color-primary)", letterSpacing: "1px", textTransform: "uppercase" }}>
                        Câu hỏi {currentQuizIndex + 1} / {lesson.questions.length}
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                        Độ khó: Trung bình
                      </span>
                    </div>

                    <div className="lexi-quiz-progress-bar-container" style={{ margin: "14px 0 28px", height: "6px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "99px", overflow: "hidden" }}>
                      <div 
                        className="lexi-quiz-progress-fill" 
                        style={{ 
                          width: `${((currentQuizIndex + 1) / lesson.questions.length) * 100}%`, 
                          height: "100%", 
                          background: "var(--color-primary)", 
                          boxShadow: "var(--shadow-neon-green)", 
                          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" 
                        }}
                      ></div>
                    </div>

                    {/* Question Statement */}
                    <h3 style={{ color: "var(--color-text-white)", fontSize: "18px", lineHeight: 1.6, fontWeight: 700, marginBottom: "24px" }}>
                      {lesson.questions[currentQuizIndex].text}
                    </h3>

                    {/* Option Grid */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {lesson.questions[currentQuizIndex].options.map((option) => {
                        const isSelected = answers[lesson.questions[currentQuizIndex].id] === option.id;
                        return (
                          <div 
                            key={option.id} 
                            onClick={() => handleSelectOption(lesson.questions[currentQuizIndex].id, option.id)}
                            className={`option-row ${isSelected ? "selected" : ""}`}
                            style={{
                              border: isSelected ? "1.5px solid var(--color-primary)" : "1px solid rgba(255, 255, 255, 0.03)",
                              background: isSelected ? "hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.08)" : "rgba(255, 255, 255, 0.01)",
                              boxShadow: isSelected ? "var(--shadow-neon-green)" : "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                              padding: "16px 20px",
                              borderRadius: "var(--radius-md)",
                              marginBottom: "0",
                              cursor: "pointer",
                              transition: "var(--transition-smooth)"
                            }}
                          >
                            <input
                              type="radio"
                              name={lesson.questions[currentQuizIndex].id}
                              value={option.id}
                              checked={isSelected}
                              onChange={() => handleSelectOption(lesson.questions[currentQuizIndex].id, option.id)}
                              style={{ cursor: "pointer", width: "16px", height: "16px" }}
                            />
                            <span style={{ fontSize: "14.5px", color: isSelected ? "var(--color-text-white)" : "var(--color-text-primary)", fontWeight: isSelected ? 600 : 500 }}>
                              {option.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Wizard Control Buttons */}
                    <div className="lexi-quiz-wizard-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "20px" }}>
                      <button
                        type="button"
                        className="lexi-cms-btn-filter-action"
                        disabled={currentQuizIndex === 0}
                        onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "8px", 
                          opacity: currentQuizIndex === 0 ? 0.3 : 1, 
                          cursor: currentQuizIndex === 0 ? "not-allowed" : "pointer",
                          height: "40px",
                          padding: "0 20px",
                          background: "rgba(255, 255, 255, 0.03)",
                          color: "var(--color-text-primary)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "var(--radius-sm)",
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        <span>Quay lại</span>
                      </button>

                      {currentQuizIndex < lesson.questions.length - 1 ? (
                        <button
                          type="button"
                          className="lexi-cms-btn-create-course"
                          disabled={!answers[lesson.questions[currentQuizIndex].id]}
                          onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            height: "40px", 
                            padding: "0 24px",
                            background: answers[lesson.questions[currentQuizIndex].id] ? "var(--color-primary)" : "rgba(255, 255, 255, 0.05)",
                            color: answers[lesson.questions[currentQuizIndex].id] ? "var(--color-text-dark)" : "var(--color-text-muted)",
                            cursor: answers[lesson.questions[currentQuizIndex].id] ? "pointer" : "not-allowed",
                            border: "none",
                            fontWeight: 700,
                            borderRadius: "var(--radius-sm)",
                            boxShadow: answers[lesson.questions[currentQuizIndex].id] ? "var(--shadow-neon-green)" : "none",
                            transition: "var(--transition-smooth)"
                          }}
                        >
                          <span>Câu tiếp theo</span>
                          <ChevronRight size={16} />
                        </button>
                      ) : (
                        <Button
                          type="button"
                          disabled={isSubmitting || !answers[lesson.questions[currentQuizIndex].id]}
                          onClick={handleQuizWizardSubmit}
                          style={{ 
                            background: "var(--color-primary-green)", 
                            boxShadow: answers[lesson.questions[currentQuizIndex].id] ? "var(--shadow-neon-green)" : "none",
                            height: "40px",
                            padding: "0 28px",
                            fontWeight: 700,
                            borderRadius: "var(--radius-sm)",
                            transition: "var(--transition-smooth)"
                          }}
                        >
                          {isSubmitting ? "Đang gửi đáp án..." : "Nộp bài làm"}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="panel" style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                    Không có câu hỏi trắc nghiệm nào cho bài học này.
                  </div>
                )}
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
                  {notesList.map((note) => (
                    <div className="lexi-note-bubble" key={note.id}>
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
                      onClick={handleDownloadNotes}
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
                    <button className="lexi-note-btn-send" style={{ position: "static", width: "28px", height: "28px" }} onClick={handleOpenSourceDocument}>
                      <Download size={12} />
                    </button>
                  </li>
                  <li style={{ background: "none", border: "1px solid #eaeaea", padding: "14px" }}>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block" }}>2. Tóm tắt Vụ án: Smith v. Jones</strong>
                      <span style={{ fontSize: "11px", color: "var(--color-muted-text)" }}>Tài liệu phân tích vụ án | DOCX</span>
                    </div>
                    <button className="lexi-note-btn-send" style={{ position: "static", width: "28px", height: "28px" }} onClick={() => handleUnavailableFeature("Tải tóm tắt vụ án")}>
                      <Download size={12} />
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* In-app Original Quiz Results Panel (Preserving original logic) */}
            {activeMenu === "quiz" && result && (
              <section className="panel result-panel lexi-animate-fade" style={{ background: "#ffffff", border: "1px solid #eaeaea", padding: "20px", marginTop: "24px" }}>
                <h2 style={{ fontSize: "20px", border: "none", padding: 0, margin: "0 0 12px" }}>Kết quả bài kiểm tra: {result.score}%</h2>
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




