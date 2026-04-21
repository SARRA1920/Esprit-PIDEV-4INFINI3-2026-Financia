import { UserResponse } from './user.model';

/** Ligne renvoyée par `GET /api/users` (entité `User` côté Spring, sans mot de passe). */
export interface AdminUserListItem extends UserResponse {
  createdAt?: string | null;
}
