export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
  role?: 'admin' | 'editor'; // Papel de visualizador removido
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export interface IAuthRepository {
  authenticate(credentials: LoginCredentials): Promise<User | null>;
  getCurrentSession(): Promise<User | null>;
  clearSession(): Promise<void>;
}
