import { Role } from './role.model';

export interface LoginRequest {
  email: string;
  password: string;
  country?: string | null;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address?: string | null;
  role?: Role | null;
  facePhotoBase64?: string | null;
}

export interface AuthUser {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string | null;
  role: Role | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
