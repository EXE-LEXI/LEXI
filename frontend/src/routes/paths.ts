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
} as const;

export type RouteMap = typeof ROUTES;
