import type { PropsWithChildren } from "react";
import { ROUTES } from "../../routes/paths";
import type { AuthResponse } from "../../types/auth";

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
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onNavigate(path);
    };
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href={ROUTES.home} onClick={handleNavigate(ROUTES.home)}>
          LEXI
        </a>
        <nav className="nav">
          <a href={ROUTES.dashboard} onClick={handleNavigate(ROUTES.dashboard)}>
            Dashboard
          </a>
          <a href={ROUTES.modules} onClick={handleNavigate(ROUTES.modules)}>
            Map
          </a>
          <a href={ROUTES.review} onClick={handleNavigate(ROUTES.review)}>
            Review
          </a>
          <a href={ROUTES.settings} onClick={handleNavigate(ROUTES.settings)}>
            Comms
          </a>
          {session?.user.role === "ADMIN" ? (
            <a href={ROUTES.admin} onClick={handleNavigate(ROUTES.admin)}>
              Admin
            </a>
          ) : null}
          {session ? (
            <button className="link-button" type="button" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <a href={ROUTES.login} onClick={handleNavigate(ROUTES.login)}>
              Login
            </a>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}
