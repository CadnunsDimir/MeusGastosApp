import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api, setApiAuthorizationHeader } from '../services/api';
import { getProfile } from '@/services/profile';
import { logoutApi } from '@/services/auth-api';

interface AuthState {
    user: { id: string; name: string } | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    firstName: string | null;
}

interface LoginPayload {
    userName: string;
    password: string;
}

interface RegisterPayload {
    userName: string;
    password: string;
}

interface AuthContextValue extends AuthState {
    isInitialized: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
    toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(() => ({
        user: null,
        token: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        isAuthenticated: Boolean(localStorage.getItem('accessToken')),
        firstName: null,
    }));
    const [isInitialized, setIsInitialized] = useState(false);

    async function refreshAccessToken(): Promise<string> {
        const refreshToken = localStorage.getItem("refreshToken");

        const { data } = await api.post("/auth/refresh", {
            refreshToken,
        });

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setState(prev => ({ ...prev, firstName: data.firstName }));

        return data.accessToken;
    }

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, []);

    useEffect(() => {
        if (state.token) {
            setApiAuthorizationHeader(state.token);
        }
        setIsInitialized(true);
        console.log("🔧IsInitialized = true");
    }, []);

    useEffect(()=> {
        var getFirstName = async ()=>{
            var profile = await getProfile();
            setState(prev => ({ ...prev, firstName: profile.firstName }));
        }
        getFirstName();
    },[])

    useEffect(() => {
        setApiAuthorizationHeader(state.token);
    }, [state.token]);

    useEffect(() => {
        let refreshPromise: Promise<string> | null = null;

        const interceptor = api.interceptors.response.use(
            (response) => {
                console.log('✅ Requisição OK:', response.config.url);
                return response;
            },
            async (error) => {
                console.log('❌ Erro capturado no interceptor:', error.response?.status, error.config?.url);

                const originalRequest = error.config as any;

                if (
                    error.response?.status !== 401 ||
                    originalRequest._retry ||
                    originalRequest.url === "/auth/refresh"
                ) {
                    return Promise.reject(error);
                }

                console.log('🔄 Tentando refresh token...');

                originalRequest._retry = true;

                try {
                    if (!refreshPromise) {
                        refreshPromise = refreshAccessToken();
                    }

                    const accessToken = await refreshPromise;
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (err) {
                    logout();
                    return Promise.reject(err);
                } finally {
                    refreshPromise = null;
                }
            }
        );

        return () => api.interceptors.response.eject(interceptor);
    }, []);

    const login = async ({ userName, password }: LoginPayload) => {
        const response = await api.post('/auth/login', { userName, password });
        const { user, accessToken, refreshToken, firstName } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        setState({ user, token: accessToken, refreshToken, isAuthenticated: true, firstName });
        setApiAuthorizationHeader(accessToken);
    };

    const register = async (payload: RegisterPayload) => {
        await api.post('/auth/newuser', payload);
        await login(payload);
    };

    const logout = () => {
        try{
            logoutApi({
                refreshToken: localStorage.getItem("refreshToken") ?? ""
            });
        } catch (e){
            console.warn(e);
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setApiAuthorizationHeader(null);
        setState({ user: null, token: null, refreshToken: null, isAuthenticated: false, firstName: null });        
    };

    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    const value = useMemo(() => ({
        ...state,
        login,
        register,
        logout,
        toggleTheme,
        isInitialized,
    }), [state, isInitialized]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};