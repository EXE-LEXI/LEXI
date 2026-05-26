import type { RouteMap } from "../routes/paths";

type DashboardPageProps = {
  apiBaseUrl: string;
  routes: RouteMap;
};

const nextItems = [
  "Connect auth forms to /auth/login and /auth/register",
  "Load /progress/me/summary for the learner dashboard",
  "Render /modules and open lesson detail from each lesson card",
  "Submit quiz answers to /lessons/:id/submit",
];

export function DashboardPage({ apiBaseUrl, routes }: DashboardPageProps) {
  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">LEXI Web</p>
          <h1>React frontend structure is ready.</h1>
          <p className="summary">
            The app now has a clean place for API clients, reusable components,
            auth session helpers, pages, routes, types, and utility code.
          </p>
        </div>
        <aside className="status-panel">
          <span>API Base URL</span>
          <strong>{apiBaseUrl}</strong>
        </aside>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h2>Frontend folders</h2>
          <ul>
            <li>api: backend request clients</li>
            <li>components: shared layout and UI</li>
            <li>features: domain logic such as auth storage</li>
            <li>pages: screen-level React components</li>
            <li>routes: route names and paths</li>
            <li>types: DTOs matching backend responses</li>
            <li>utils: reusable helpers</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Next implementation</h2>
          <ul>
            {nextItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Routes prepared</h2>
          <dl className="route-list">
            {Object.entries(routes).map(([name, path]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{path}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>
    </main>
  );
}
