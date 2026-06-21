// src/types/user.types.ts

export interface UserResponse {
  id: number;
  externalId: string;
  fullName: string;
  bio?: string | null;
  profilePicturePath?: string | null;
  roles?: string[];
}

export interface CreateSystemUserCommand {
  externalId: string;
  fullName: string;
  bio?: string | null;
  profilePicturePath?: string | null;
}
