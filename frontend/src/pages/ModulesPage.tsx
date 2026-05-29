import React from "react";
import type { LearningCategory, LearningModule, LessonDetail } from "../types/learning";
import type { AuthResponse } from "../types/auth";
import { ROUTES } from "../routes/paths";
import { 
  LayoutDashboard, 
  Compass, 
  Award, 
  History, 
  Settings, 
  Play, 
  Lock, 
  Star, 
  BookOpen, 
  Gavel, 
  Flame, 
  HelpCircle,
  Tv,
  Gamepad2
} from "lucide-react";

type ModulesPageProps = {
  categories: LearningCategory[];
  selectedCategoryId: string | null;
  modules: LearningModule[];
  isLoading: boolean;
  error: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onOpenLesson: (lessonId: string) => void;
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
};

export const ModulesPage: React.FC<ModulesPageProps> = ({
  categories,
  selectedCategoryId,
  modules,
  isLoading,
  error,
  onSelectCategory,
  onOpenLesson,
  session,
  onNavigate,
}) => {

  const fullName = session?.user?.profile?.fullName || session?.user?.email || "Học viên";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const userStreak = session?.user?.profile?.streak || 12;
  const userXp = session?.user?.profile?.xp || 1200;
  const lexiCoins = Math.floor(userXp / 3) || 450;

  // Compute Active module name
  const activeCategory = categories.find(c => c.id === selectedCategoryId);
  const activeTitle = activeCategory?.title 
    ? `Luật ${activeCategory.title} Việt Nam`
    : "Luật Dân sự Việt Nam";

  const activeSubtitle = activeCategory?.title === "Hình sự"
    ? "Hành trình khám phá định nghĩa tội phạm & cấu thành hình phạt"
    : activeCategory?.title === "Thương mại"
      ? "Lộ trình học về giao dịch kinh tế, thương nhân và hợp đồng thương mại"
      : "Hành trình khám phá các quyền và nghĩa vụ cơ bản";

  // Flatten lessons to dynamically decide Node States: Completed -> Active -> Locked
  let globalLessonIndex = 0;
  let activeFound = false;

  const resolvedModules = modules.map((module, mIdx) => {
    const resolvedLessons = module.lessons.map((lesson) => {
      let state: "completed" | "active" | "locked" = "locked";
      
      // Let's mock a few completed lessons if xp is high, or use isCompleted field
      // Rule: first 3 global index are completed if user has xp > 500
      const isMockCompleted = globalLessonIndex < 3 && userXp > 500;
      
      if (isMockCompleted) {
        state = "completed";
      } else if (!activeFound) {
        state = "active";
        activeFound = true; // only one active node at a time!
      } else {
        state = "locked";
      }

      const nodeIndex = globalLessonIndex;
      globalLessonIndex++;

      return {
        ...lesson,
        state,
        nodeIndex
      };
    });

    return {
      ...module,
      resolvedLessons
    };
  });

  // Calculate dynamic overall module progress percentage
  const totalLessons = globalLessonIndex;
  const completedLessons = resolvedModules.reduce((acc, m) => 
    acc + m.resolvedLessons.filter(l => l.state === "completed").length, 0
  );
  const progressPercent = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 24;

  // Stagger offsets for Serpentine path (S-curve margins)
  // Sequence matches mockup flow: center -> right -> center -> left -> center
  const STAGGER_OFFSETS = [
    "30%", // Node 0
    "50%", // Node 1
    "40%", // Node 2
    "60%", // Node 3 (peak curve)
    "45%", // Node 4
    "30%", // Node 5 (locked curve left)
    "20%", // Node 6
    "35%", // Node 7
    "50%"  // Node 8
  ];

  // Map node index to visual icon
  function renderNodeIcon(state: "completed" | "active" | "locked", index: number) {
    if (state === "locked") {
      return <Lock size={18} />;
    }
    if (state === "active") {
      return <Play size={20} className="fill-white stroke-white" />;
    }
    // Completed node custom icons sequence
    if (index % 3 === 0) {
      return <Star size={18} className="fill-white stroke-white" />;
    }
    if (index % 3 === 1) {
      return <BookOpen size={18} />;
    }
    return <Gavel size={18} />;
  }

  return (
    <div className="lexi-roadmap-root">
      <div className="lexi-roadmap-container">
        
        {/* =======================================================
           LEFT SIDEBAR NAVIGATION
           ======================================================= */}
        <aside className="lexi-roadmap-sidebar">
          <div className="lexi-sidebar-logo-block">
            <span className="lexi-sidebar-logo">Lexi</span>
          </div>

          <nav className="lexi-sidebar-menu">
            <a href="/" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.home); }}>
              <LayoutDashboard size={18} />
              <span>Tổng quan</span>
            </a>
            <a href="/modules" className="active" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.modules); }}>
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
            <a href="/shorts" onClick={(e) => { e.preventDefault(); onNavigate(ROUTES.shorts); }}>
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
           RIGHT MAIN ROADMAP PANEL
           ======================================================= */}
        <main className="lexi-roadmap-main">
          
          {/* Header & Badges */}
          <header className="lexi-roadmap-header">
            <div className="lexi-roadmap-header-left">
              <h2>{activeTitle}</h2>
              <p>{activeSubtitle}</p>
            </div>

            <div className="lexi-roadmap-header-right">
              <span className="lexi-roadmap-pill orange">
                <Flame size={14} className="fill-orange" />
                <span>{userStreak} ngày</span>
              </span>
              <span className="lexi-roadmap-pill green">
                <span>🪙</span>
                <span>{lexiCoins} LC</span>
              </span>
            </div>
          </header>

          {/* Module segmented tab selector */}
          <div className="lexi-roadmap-category-bar">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`lexi-roadmap-tab-btn ${selectedCategoryId === category.id ? "active" : ""}`}
                onClick={() => onSelectCategory(category.id)}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/* Program Progress Indicator */}
          <div className="panel lexi-roadmap-progress-panel">
            <div className="lexi-roadmap-progress-header">
              <span>Tiến độ chương trình</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="lexi-roadmap-progress-bar">
              <span style={{ width: `${progressPercent}%` }}></span>
            </div>
          </div>

          {/* serpentine Winding Roadmap Curve container */}
          <div className="lexi-roadmap-winding-path-container">
            
            {/* Curved Winding Road Line Representation */}
            <div className="lexi-winding-road-svg-overlay">
              <svg width="100%" height="100%" viewBox="0 0 500 800" preserveAspectRatio="none" fill="none">
                <path 
                  d="M 180 50 C 350 150, 400 250, 200 350 C 50 450, 100 550, 300 650" 
                  stroke="#e2e8f0" 
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path 
                  d="M 180 50 C 350 150, 400 250, 200 350 C 50 450, 100 550, 300 650" 
                  stroke="#006241" 
                  strokeWidth="8"
                  strokeDasharray="20 15"
                  strokeLinecap="round"
                  opacity="0.15"
                />
              </svg>
            </div>

            {/* List of Winding nodes grouped by Chapters (Modules) */}
            <div className="lexi-roadmap-chapters-list">
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <span className="animate-pulse">Đang đồng bộ hóa bản đồ học tập...</span>
                </div>
              ) : null}
              
              {error ? (
                <div className="error-text" style={{ textAlign: "center", padding: "20px" }}>
                  <span>⚠️ Lỗi: {error}</span>
                </div>
              ) : null}

              {resolvedModules.map((module, mIdx) => (
                <div className="lexi-roadmap-chapter" key={module.id}>
                  
                  {/* Chapter Heading Banner */}
                  <div className="lexi-chapter-header-box">
                    <span className="lexi-chapter-number">Chương {mIdx + 1}</span>
                    <h4 className="lexi-chapter-title">{module.title}</h4>
                  </div>

                  {/* Staggered serpenine list of lessons */}
                  <div className="lexi-chapter-nodes-group">
                    {module.resolvedLessons.map((lesson) => {
                      const offsetLeft = STAGGER_OFFSETS[lesson.nodeIndex % STAGGER_OFFSETS.length];
                      
                      return (
                        <div 
                          className="lexi-roadmap-node-row" 
                          key={lesson.id}
                          style={{ paddingLeft: offsetLeft }}
                        >
                          <div className="lexi-node-interactive-container">
                            <button
                              type="button"
                              className={`lexi-roadmap-node-btn ${lesson.state}`}
                              disabled={lesson.state === "locked"}
                              onClick={() => onOpenLesson(lesson.id)}
                              title={lesson.title}
                            >
                              {renderNodeIcon(lesson.state, lesson.nodeIndex)}
                            </button>

                            {/* Label overlay below or beside active node */}
                            {lesson.state === "active" && (
                              <div className="lexi-node-active-tooltip">
                                <span>Bài {lesson.sortOrder + 1}: {lesson.title}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}

              {/* Bottom update marker */}
              <div className="lexi-roadmap-bottom-marker">
                <span>— Nội dung đang được cập nhật —</span>
              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
};
export default ModulesPage;
