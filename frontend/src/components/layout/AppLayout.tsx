import type { PropsWithChildren } from "react";
import { ROUTES } from "../../routes/paths";
import type { AuthResponse } from "../../types/auth";
import { Bell, Settings, LogOut } from "lucide-react";
import { LegalDisclaimer } from "./LegalDisclaimer";
import { ChatbotWidget } from "../common/ChatbotWidget";

type AppLayoutProps = PropsWithChildren<{
  session: AuthResponse | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}>;

export function AppLayout({
  children,
  session,
  onNavigate,
  onLogout,
}: AppLayoutProps) {
  function handleNavigate(path: string) {
    return (event: React.MouseEvent<any>) => {
      event.preventDefault();
      onNavigate(path);
    };
  }

  const fullName = session?.user?.profile?.fullName || session?.user?.email || "Học viên";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentPath = window.location.pathname;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-logo-block">
          <a className="brand" href={ROUTES.home} onClick={handleNavigate(ROUTES.home)}>
            <span>LEXI</span>
          </a>
        </div>

        <nav className="nav">
          {session ? (
            <>
              <a 
                href={ROUTES.home} 
                className={currentPath === ROUTES.dashboard || currentPath === ROUTES.home || currentPath === "/" ? "active" : ""} 
                onClick={handleNavigate(ROUTES.home)}
              >
                <span>Bảng điều khiển</span>
              </a>
              <a 
                href={ROUTES.modules} 
                className={currentPath === ROUTES.modules || currentPath.startsWith("/lessons") ? "active" : ""} 
                onClick={handleNavigate(ROUTES.modules)}
              >
                <span>Khóa học</span>
              </a>
              <a 
                href={ROUTES.community} 
                className={currentPath === ROUTES.community ? "active" : ""} 
                onClick={handleNavigate(ROUTES.community)}
              >
                <span>Cộng đồng</span>
              </a>
              <a 
                href={ROUTES.resources} 
                className={currentPath === ROUTES.resources ? "active" : ""} 
                onClick={handleNavigate(ROUTES.resources)}
              >
                <span>Tài nguyên</span>
              </a>
              <a 
                href={ROUTES.shorts} 
                className={currentPath === ROUTES.shorts ? "active" : ""} 
                onClick={handleNavigate(ROUTES.shorts)}
              >
                <span>Video Ngắn</span>
              </a>
              <a 
                href={ROUTES.game} 
                className={currentPath === ROUTES.game ? "active" : ""} 
                onClick={handleNavigate(ROUTES.game)}
              >
                <span>Đấu trường</span>
              </a>
              <a
                href={ROUTES.rewards}
                className={currentPath === ROUTES.rewards ? "active" : ""}
                onClick={handleNavigate(ROUTES.rewards)}
              >
                <span>Rewards</span>
              </a>
            </>
          ) : (
            <a href={ROUTES.login} className="active" onClick={handleNavigate(ROUTES.login)}>
              <span>Đăng nhập</span>
            </a>
          )}
        </nav>

        {session ? (
          <div className="topbar-right-widgets">
            <button 
              className="btn-upgrade-pro"
              onClick={handleNavigate(ROUTES.subscription)}
            >
              Nâng cấp Pro
            </button>
            
            <button 
              className={`icon-btn ${currentPath === ROUTES.notifications ? "active" : ""}`} 
              title="Thông báo"
              onClick={handleNavigate(ROUTES.notifications)}
            >
              <Bell size={18} />
            </button>
            
            <a 
              href={ROUTES.settings} 
              className={`icon-btn ${currentPath === ROUTES.settings ? "active" : ""}`}
              title="Cài đặt"
              onClick={handleNavigate(ROUTES.settings)}
            >
              <Settings size={18} />
            </a>

            <div 
              className="nav-user-avatar" 
              title={fullName}
              style={{ cursor: "pointer" }}
              onClick={handleNavigate(ROUTES.profile)}
            >
              {initials}
            </div>

            <button 
              className="icon-btn logout-btn" 
              type="button" 
              onClick={onLogout} 
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="topbar-right-widgets">
            <button className="btn-upgrade-pro" onClick={handleNavigate(ROUTES.login)}>
              Đăng nhập
            </button>
          </div>
        )}
      </header>
      <LegalDisclaimer
        onReportContent={() => {
          window.sessionStorage.setItem(
            "lexiFeedbackPath",
            window.location.pathname
          );
          onNavigate(ROUTES.feedback);
        }}
      />
      {children}
      <ChatbotWidget session={session} />
    </div>
  );
}
export default AppLayout;
