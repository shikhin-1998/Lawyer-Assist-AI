export interface User {
  id: string;
  email: string;
  name: string;
  role: 'lawyer' | 'assistant' | 'admin';
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'lawyer' | 'assistant';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
