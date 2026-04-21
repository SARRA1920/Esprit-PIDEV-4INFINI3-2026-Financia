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
}
