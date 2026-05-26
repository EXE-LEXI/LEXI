export type UserRole = "LEARNER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED";

export type AuthUserProfile = {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  xp: number;
  streak: number;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  profile: AuthUserProfile | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
