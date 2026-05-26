import type { PropsWithChildren } from "react";
import { ROUTES } from "../../routes/paths";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href={ROUTES.home}>
          LEXI
        </a>
        <nav className="nav">
          <a href={ROUTES.dashboard}>Dashboard</a>
          <a href={ROUTES.modules}>Modules</a>
          <a href={ROUTES.login}>Login</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
