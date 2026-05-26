export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  modules: "/modules",
  lesson: "/lessons/:lessonId",
  profile: "/profile",
} as const;

export type RouteMap = typeof ROUTES;
