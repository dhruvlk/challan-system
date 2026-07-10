export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}
