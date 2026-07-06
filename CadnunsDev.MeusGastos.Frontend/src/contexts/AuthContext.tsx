import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

interface AuthState {
  user: { id: string; name: string } | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    token: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: Boolean(localStorage.getItem('accessToken'))
  }));

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && state.refreshToken) {
          try {
            const refreshResponse = await api.post('/auth/refresh', {
              refreshToken: state.refreshToken
            });
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            setState((prev) => ({
              ...prev,
              token: refreshResponse.data.accessToken,
              isAuthenticated: true
            }));
            error.config.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            return api.request(error.config);
          } catch {
            handleLogout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [state.refreshToken]);

  const handleLogin = async ({ email, password }: LoginPayload) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setState({ user, token: accessToken, refreshToken, isAuthenticated: true });
  };

  const handleRegister = async ({ name, email, password }: RegisterPayload) => {
    await api.post('/auth/newuser', { name, email, password });
    await handleLogin({ email, password });
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  const value = useMemo(
    () => ({
      ...state,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      toggleTheme
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
