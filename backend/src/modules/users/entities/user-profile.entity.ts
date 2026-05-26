export class UserProfileEntity {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  xp: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}
