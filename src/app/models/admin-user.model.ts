import { UserResponse, UserRole } from './user.model';

/** Ligne renvoyée par `GET /api/users` (entité `User` côté Spring, sans mot de passe). */
export interface AdminUserListItem extends UserResponse {
  createdAt?: string | null;
}

/** Corps `POST /api/users` ou `PUT /api/users/{id}` (entité `User` côté Spring). */
export interface AdminUserWriteBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string | null;
  role: UserRole | null;
  monthlyIncome: number | null;
  password?: string;
}
