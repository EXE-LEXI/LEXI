import React, { useState, useRef, useEffect } from "react";
import { 
  LayoutDashboard, 
  Compass, 
  Award, 
  History, 
  Settings, 
  Flame, 
  Tv, 
  Volume2, 
  VolumeX, 
  Heart, 
  Bookmark, 
  MessageCircle, 
  Share2, 
  HelpCircle, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  Gamepad2
} from "lucide-react";
import type { AuthResponse } from "../types/auth";
import { ROUTES } from "../routes/paths";

type ShortsPageProps = {
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
};

type LegalShortVideo = {
  id: string;
  category: "fraud" | "civil" | "trivia";
  title: string;
  author: string;
  description: string;
  videoUrl: string;
  likes: number;
  commentsCount: number;
  bookmarksCount: number;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

const VIDEOS_DATA: LegalShortVideo[] = [
  {
    id: "v-1",
    category: "fraud",
    title: "Nhận diện cuộc gọi AI Deepfake giả danh vay tiền gấp",
    author: "Cảnh Báo Phòng Chống Tội Phạm AI",
    description: "Cảnh giác chiêu trò lừa đảo công nghệ cao tinh vi: Kẻ gian dùng AI Deepfake tái tạo khuôn mặt và giọng nói của người thân để hỏi mượn tiền gấp...",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-scifi-cyberpunk-looking-hud-40224-large.mp4",
    likes: 1240,
    commentsCount: 342,
    bookmarksCount: 890,
    quiz: {
      question: "Công nghệ Deepfake AI đang bị kẻ gian sử dụng chủ yếu để thực hiện mục đích gì trong lừa đảo trực tuyến?",
      options: [
        "Chỉnh sửa hình ảnh đẹp mắt miễn phí",
        "Giả dạng hình ảnh & giọng nói người thân để thực hiện cuộc gọi vay tiền khẩn cấp",
        "Tự động gửi email quảng cáo bán hàng loạt"
      ],
      correctIndex: 1,
      explanation: "Kẻ lừa đảo sử dụng hình ảnh thu thập trên mạng xã hội để tạo cuộc gọi Deepfake ngắn chất lượng kém, ngắt giữa chừng, giả vờ sóng yếu để lừa tiền người thân."
    }
  },
  {
    id: "v-2",
    category: "civil",
    title: "Sinh viên thuê phòng trọ muốn đơn phương chấm dứt hợp đồng?",
    author: "Hỏi Đáp Luật Dân Sự 2015",
    description: "Sinh viên đi thuê phòng trọ có được quyền đơn phương hủy hợp đồng trước hạn không? Tìm hiểu chính xác điều kiện và quy định của Bộ luật Dân sự 2015...",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-holding-a-fountain-pen-writing-in-a-notebook-42283-large.mp4",
    likes: 854,
    commentsCount: 195,
    bookmarksCount: 420,
    quiz: {
      question: "Nếu không có thỏa thuận khác, người thuê nhà phải báo trước bao nhiêu ngày để đơn phương chấm dứt hợp đồng thuê nhà đúng luật?",
      options: [
        "Báo trước ít nhất 10 ngày",
        "Báo trước ít nhất 30 ngày",
        "Có thể dọn đi bất cứ lúc nào không cần báo trước"
      ],
      correctIndex: 1,
      explanation: "Theo Điều 428 BLDS 2015, khi đơn phương chấm dứt thực hiện hợp đồng, bên chấm dứt phải thông báo ngay cho bên kia biết trước thời hạn quy định (thường là 30 ngày) để tránh bồi thường thiệt hại."
    }
  },
  {
    id: "v-3",
    category: "fraud",
    title: "Bẫy lừa đảo: Tuyển dụng cộng tác viên giật đơn hàng online",
    author: "Phòng Vệ An Ninh Mạng Việt Nam",
    description: "Hàng ngàn nạn nhân đã sập bẫy chiêu trò giật đơn hàng online nhận hoa hồng khủng. Kẻ gian dụ dỗ nạp tiền tăng dần để rồi khóa hoàn toàn tài khoản rút tiền...",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-typing-on-a-phone-41480-large.mp4",
    likes: 2150,
    commentsCount: 680,
    bookmarksCount: 1450,
    quiz: {
      question: "Kẻ lừa đảo giật đơn hàng online thường dùng thủ đoạn nào ở những đơn hàng đầu tiên (giá trị nhỏ) để lấy lòng tin nạn nhân?",
      options: [
        "Hoàn trả đầy đủ cả tiền gốc và hoa hồng nhỏ ngay lập tức",
        "Yêu cầu nạp ngay 50 triệu đồng để làm nhiệm vụ lớn",
        "Chuyển quà tặng hiện vật đắt tiền bằng bưu tá"
      ],
      correctIndex: 0,
      explanation: "Kẻ gian sẽ luôn hoàn tiền và chia hoa hồng đầy đủ ở 1-2 nhiệm vụ đầu để kích thích lòng tham, sau đó bắt nộp số tiền lớn ở các nhiệm vụ tiếp theo rồi biến mất."
    }
  },
  {
    id: "v-4",
    category: "trivia",
    title: "Mua hàng online không nhận (Boom hàng) có bị phạt không?",
    author: "Bách Khoa Thư Pháp Luật",
    description: "Boom hàng không chỉ gây thiệt hại cho shipper và chủ shop mà còn có thể chịu các chế tài pháp lý nhất định. Cùng tìm hiểu quy định về hợp đồng mua bán...",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-scifi-cyberpunk-looking-hud-40224-large.mp4",
    likes: 670,
    commentsCount: 124,
    bookmarksCount: 290,
    quiz: {
      question: "Hành vi đặt mua hàng online nhưng từ chối nhận hàng không có lý do chính đáng về mặt pháp lý được xem là vi phạm gì?",
      options: [
        "Vi phạm nghĩa vụ thực hiện hợp đồng mua bán tài sản",
        "Vi phạm quy chế hình sự quốc tế",
        "Không vi phạm bất kỳ thỏa ước nào"
      ],
      correctIndex: 0,
      explanation: "Việc click mua hàng online cấu thành giao dịch dân sự hợp đồng mua bán. Từ chối nhận mà không có lỗi của bên bán là vi phạm nghĩa vụ hợp đồng, bên bán có thể yêu cầu bồi thường chi phí giao hàng."
    }
  }
];

export const ShortsPage: React.FC<ShortsPageProps> = ({ session, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<"all" | "fraud" | "civil" | "trivia">("all");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Record<string, boolean>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [userCoins, setUserCoins] = useState(session?.user?.profile?.xp ? Math.floor(session.user.profile.xp / 3) : 450);
  const [userXp, setUserXp] = useState(session?.user?.profile?.xp || 1200);
  const [showRewardToast, setShowRewardToast] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Filter videos
  const filteredVideos = VIDEOS_DATA.filter(
    (v) => activeCategory === "all" || v.category === activeCategory
  );

  const currentVideo = filteredVideos[currentVideoIndex] || filteredVideos[0];

  // Auto-play / control video elements
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Auto-play might be blocked by browser on first load
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isMuted, currentVideoIndex, activeCategory]);

  // Reset quiz state when video changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsQuizSubmitted(false);
    setIsPlaying(true);
  }, [currentVideoIndex, activeCategory]);

  const fullName = session?.user?.profile?.fullName || session?.user?.email || "Học viên";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const userStreak = session?.user?.profile?.streak || 12;

  function handleTogglePlay() {
    setIsPlaying(!isPlaying);
  }

  function handleToggleMute() {
    setIsMuted(!isMuted);
  }

  function handleNextVideo() {
    if (currentVideoIndex < filteredVideos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setCurrentVideoIndex(0); // Loop back
    }
  }

  function handlePrevVideo() {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else {
      setCurrentVideoIndex(filteredVideos.length - 1); // Loop to end
    }
  }

  function handleToggleLike(videoId: string) {
    setLikedVideos((prev) => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  }

  function handleToggleBookmark(videoId: string) {
    setBookmarkedVideos((prev) => ({
      ...prev,
      [videoId]: !prev[videoId]
    }));
  }

  function handleAnswerSelect(idx: number) {
    if (isQuizSubmitted) return;
    setSelectedAnswer(idx);
  }

  function handleSubmitQuiz() {
    if (selectedAnswer === null || isQuizSubmitted) return;

    setIsQuizSubmitted(true);
    if (selectedAnswer === currentVideo.quiz.correctIndex) {
      // Award points
      setUserCoins((prev) => prev + 5);
      setUserXp((prev) => prev + 10);
      setShowRewardToast(true);
      setTimeout(() => setShowRewardToast(false), 3000);
    }
  }

  return (
    <div className="lexi-shorts-root">
      
      {/* Toast Notification for Rewards */}
      {showRewardToast && (
        <div className="lexi-reward-toast">
          <span>🎉 Trả lời đúng! Nhận ngay <strong>+5 Lexi Coins</strong> & <strong>+10 XP</strong>!</span>
        </div>
      )}

      <div className="lexi-shorts-container">
        
        {/* =======================================================
           LEFT SIDEBAR NAVIGATION
           ======================================================= */}
        <aside className="lexi-shorts-sidebar">
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
            <a href="#history" onClick={(e) => e.preventDefault()}>
              <History size={18} />
              <span>Lịch sử học</span>
            </a>
            <a href="/shorts" className="active" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.shorts); }}>
              <Tv size={18} />
              <span>Video Ngắn</span>
            </a>
            <a href="/game" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.game); }}>
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
              onClick={() => alert("Tính năng Nâng cấp Premium sắp ra mắt!")}
            >
              Nâng cấp Premium
            </button>
          </div>
        </aside>

        {/* =======================================================
           CENTER MAIN VIDEO PANEL
           ======================================================= */}
        <main className="lexi-shorts-main-layout">
          
          {/* Header Row Stats */}
          <header className="lexi-shorts-header">
            <div className="lexi-shorts-header-left">
              <h2>Lexi Shorts</h2>
              <p>Pháp lý giải trí & Phòng tránh lừa đảo đa chiều</p>
            </div>

            <div className="lexi-shorts-header-right">
              <span className="lexi-shorts-pill orange">
                <Flame size={14} className="fill-orange" />
                <span>{userStreak} ngày</span>
              </span>
              <span className="lexi-shorts-pill green">
                <span>🪙</span>
                <span>{userCoins} LC</span>
              </span>
              <span className="lexi-shorts-pill xp-pill">
                <span>⚡ {userXp} XP</span>
              </span>
            </div>
          </header>

          {/* Central Workspace layout */}
          <div className="lexi-shorts-workspace">
            
            {/* 1. vertical Video Player column */}
            <div className="lexi-video-feed-column">
              
              {currentVideo ? (
                <div className="lexi-shorts-player-card">
                  
                  {/* HTML5 video tag */}
                  <video
                    ref={videoRef}
                    src={currentVideo.videoUrl}
                    className="lexi-shorts-video-element"
                    loop
                    playsInline
                    onClick={handleTogglePlay}
                  />

                  {/* Top action overlays: sound & loading indication */}
                  <div className="lexi-shorts-top-overlay">
                    <button 
                      className="lexi-btn-player-control" 
                      onClick={handleToggleMute}
                      title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    <span className="lexi-video-category-tag">
                      {currentVideo.category === "fraud" ? "🛡️ Lừa Đảo" : currentVideo.category === "civil" ? "🏠 Dân Sự" : "💡 Mẹo Luật"}
                    </span>
                  </div>

                  {/* Big Play/Pause indicator overlay */}
                  {!isPlaying && (
                    <div className="lexi-player-paused-icon" onClick={handleTogglePlay}>
                      <Play size={44} className="fill-white stroke-white" />
                    </div>
                  )}

                  {/* Side floating control buttons overlay */}
                  <div className="lexi-shorts-right-actions">
                    
                    {/* Like button */}
                    <button 
                      className={`lexi-float-action ${likedVideos[currentVideo.id] ? "liked" : ""}`}
                      onClick={() => handleToggleLike(currentVideo.id)}
                    >
                      <Heart size={22} className={likedVideos[currentVideo.id] ? "fill-red stroke-red" : ""} />
                      <span>{currentVideo.likes + (likedVideos[currentVideo.id] ? 1 : 0)}</span>
                    </button>

                    {/* Bookmark */}
                    <button 
                      className={`lexi-float-action ${bookmarkedVideos[currentVideo.id] ? "bookmarked" : ""}`}
                      onClick={() => handleToggleBookmark(currentVideo.id)}
                    >
                      <Bookmark size={22} className={bookmarkedVideos[currentVideo.id] ? "fill-gold stroke-gold" : ""} />
                      <span>{currentVideo.bookmarksCount + (bookmarkedVideos[currentVideo.id] ? 1 : 0)}</span>
                    </button>

                    {/* Comment */}
                    <button 
                      className="lexi-float-action"
                      onClick={() => alert("Tính năng xem bình luận video sắp ra mắt!")}
                    >
                      <MessageCircle size={22} />
                      <span>{currentVideo.commentsCount}</span>
                    </button>

                    {/* Share */}
                    <button 
                      className="lexi-float-action"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Đã sao chép liên kết video Lexi Shorts!");
                      }}
                    >
                      <Share2 size={22} />
                      <span>Chia sẻ</span>
                    </button>

                  </div>

                  {/* Bottom Text Metadata overlay */}
                  <div className="lexi-shorts-bottom-meta">
                    <div className="lexi-shorts-meta-header">
                      <div className="lexi-shorts-author-avatar">L</div>
                      <div className="lexi-shorts-author-info">
                        <strong>@{currentVideo.author}</strong>
                        <span>Chuyên gia Luật học</span>
                      </div>
                    </div>
                    
                    <h4 className="lexi-shorts-video-title">{currentVideo.title}</h4>
                    <p className="lexi-shorts-video-desc">{currentVideo.description}</p>
                    
                    {/* Spinning vinyl music representation */}
                    <div className="lexi-music-vinyl-wrapper">
                      <div className="lexi-vinyl-disc-spin"></div>
                      <span className="lexi-music-track-text">Lexi Original Sound - Báo Động Pháp Lý</span>
                    </div>
                  </div>

                  {/* Dynamic absolute custom thin video progress bar */}
                  <div className="lexi-video-progress-tracker-line">
                    <span className="lexi-video-progress-line-active" style={{ width: isPlaying ? "100%" : "30%" }}></span>
                  </div>

                </div>
              ) : (
                <div className="lexi-no-videos-layout">
                  <Tv size={48} />
                  <p>Không có video nào trong danh mục này.</p>
                </div>
              )}

              {/* Navigation overlay controls for switching feed slides */}
              <div className="lexi-feed-switches">
                <button className="lexi-btn-slide-switch" onClick={handlePrevVideo}>
                  ▲ Video trước
                </button>
                <button className="lexi-btn-slide-switch active" onClick={handleNextVideo}>
                  ▼ Video kế tiếp
                </button>
              </div>

            </div>

            {/* 2. Interactive Gamified Quiz & Categories side panel */}
            <div className="lexi-shorts-right-sidebar-panel">
              
              {/* Category switches box */}
              <div className="panel lexi-shorts-categories-box">
                <h3>Chuyên mục pháp lý</h3>
                <div className="lexi-shorts-cat-triggers">
                  <button 
                    className={`lexi-shorts-cat-btn ${activeCategory === "all" ? "active" : ""}`}
                    onClick={() => { setActiveCategory("all"); setCurrentVideoIndex(0); }}
                  >
                    🚀 Tất cả feeds
                  </button>
                  <button 
                    className={`lexi-shorts-cat-btn ${activeCategory === "fraud" ? "active" : ""}`}
                    onClick={() => { setActiveCategory("fraud"); setCurrentVideoIndex(0); }}
                  >
                    🛡️ Lừa đảo công nghệ
                  </button>
                  <button 
                    className={`lexi-shorts-cat-btn ${activeCategory === "civil" ? "active" : ""}`}
                    onClick={() => { setActiveCategory("civil"); setCurrentVideoIndex(0); }}
                  >
                    🏠 Luật Dân sự & Đời sống
                  </button>
                  <button 
                    className={`lexi-shorts-cat-btn ${activeCategory === "trivia" ? "active" : ""}`}
                    onClick={() => { setActiveCategory("trivia"); setCurrentVideoIndex(0); }}
                  >
                    💡 Trivia & Chuyện vặt
                  </button>
                </div>
              </div>

              {/* Gamified Interactive Mini-Quiz Box */}
              {currentVideo && (
                <div className="panel lexi-shorts-quiz-card">
                  <div className="lexi-shorts-quiz-header">
                    <HelpCircle size={20} className="text-emerald" />
                    <h4>Hỏi nhanh đáp gọn</h4>
                  </div>
                  
                  <p className="lexi-shorts-quiz-question">
                    {currentVideo.quiz.question}
                  </p>

                  <div className="lexi-shorts-quiz-options">
                    {currentVideo.quiz.options.map((opt, idx) => {
                      let btnClass = "";
                      if (isQuizSubmitted) {
                        if (idx === currentVideo.quiz.correctIndex) {
                          btnClass = "correct";
                        } else if (idx === selectedAnswer) {
                          btnClass = "wrong";
                        } else {
                          btnClass = "disabled";
                        }
                      } else if (idx === selectedAnswer) {
                        btnClass = "selected";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`lexi-quiz-option-btn ${btnClass}`}
                          onClick={() => handleAnswerSelect(idx)}
                          disabled={isQuizSubmitted}
                        >
                          <span className="lexi-opt-bullet">{String.fromCharCode(65 + idx)}</span>
                          <span className="lexi-opt-label-text">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Submission and results banner triggers */}
                  {!isQuizSubmitted ? (
                    <button
                      className="lexi-btn-submit-shorts-quiz"
                      disabled={selectedAnswer === null}
                      onClick={handleSubmitQuiz}
                    >
                      Kiểm tra câu trả lời (+5 LC)
                    </button>
                  ) : (
                    <div className={`lexi-shorts-result-banner ${selectedAnswer === currentVideo.quiz.correctIndex ? "success" : "failure"}`}>
                      <div className="lexi-result-banner-header">
                        {selectedAnswer === currentVideo.quiz.correctIndex ? (
                          <>
                            <CheckCircle size={16} />
                            <strong>Chính xác! (+5 LC & +10 XP)</strong>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={16} />
                            <strong>Chưa đúng rồi!</strong>
                          </>
                        )}
                      </div>
                      <p className="lexi-result-explain-text">
                        <strong>Giải thích chuyên gia:</strong> {currentVideo.quiz.explanation}
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </main>

      </div>
    </div>
  );
};
