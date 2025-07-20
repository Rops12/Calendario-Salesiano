export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'coordinator' | 'teacher';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
}

export interface IAuthRepository {
  authenticate(credentials: LoginCredentials): Promise<User | null>;
  getCurrentSession(): Promise<User | null>;
  clearSession(): Promise<void>;
}