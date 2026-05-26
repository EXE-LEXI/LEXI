import { UserRole, UserStatus } from "@prisma/client";
import { UserProfileEntity } from "./user-profile.entity";

export class UserEntity {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfileEntity | null;
}
