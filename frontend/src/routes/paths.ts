export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  modules: "/modules",
  review: "/review",
  leaderboard: "/leaderboard",
  settings: "/settings",
  admin: "/admin",
  lesson: "/lessons/:lessonId",
  profile: "/profile",
  resources: "/resources",
  shorts: "/shorts",
  game: "/game",
} as const;

export type RouteMap = typeof ROUTES;
