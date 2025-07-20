import { IAuthService, User, LoginCredentials } from '@/services/interfaces/IAuthService';

const AUTH_STORAGE_KEY = 'auth-user';

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@salesiano.com.br',
    isAdmin: true,
  },
  {
    id: '2',
    email: 'coordenador@salesiano.com.br',
    isAdmin: false,
  },
  {
    id: '3',
    email: 'professor@salesiano.com.br',
    isAdmin: false,
  },
];

const mockPasswords: Record<string, string> = {
  'admin@salesiano.com.br': 'admin123',
  'coordenador@salesiano.com.br': 'coord123',
  'professor@salesiano.com.br': 'prof123',
};

export class LocalStorageAuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === credentials.email);
    const expectedPassword = mockPasswords[credentials.email];

    if (!user || expectedPassword !== credentials.password) {
      throw new Error('Credenciais inválidas');
    }

    // Store user in localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}