export type UserRole = 'ADMIN' | 'AGENT' | 'CLIENT';

export interface UserResponse {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole | null;
  monthlyIncome: number | null;
  /** Années depuis l'inscription ; calculé côté serveur. */
  yearsAsClient: number | null;
  /** Objectif / description de projet (recommandations formations). */
  projectGoal?: string | null;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: UserRole | null;
  monthlyIncome: number | null;
  /** Photo visage (data URL ou base64) pour enrôlement Face ID au moment de l'inscription. */
  facePhotoBase64?: string | null;
}

/** Réponse de POST /api/auth/google-profile (étape 1 inscription Google). */
export interface GoogleProfileResponse {
  firstName: string;
  lastName: string;
  email: string;
}

/** Corps de POST /api/auth/register-google (étape 2). */
export interface GoogleRegisterRequest {
  idToken: string;
  phone: string;
  address: string;
  password: string;
  role: UserRole | null;
  monthlyIncome: number | null;
  facePhotoBase64?: string | null;
}