import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

const AuthContext = createContext(undefined);

function normalizeRole(user) {
  const role = String(user?.role || '').trim().toLowerCase();
  if (!role) return 'viewer';
  return role;
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  async function bootstrap() {
    const authSource = apiClient.getStoredAuthSource();
    if (authSource === 'sso') {
      const hasPortalSession = await apiClient.hasActiveSsoPortalSession();
      if (hasPortalSession === false) {
        try {
          await apiClient.logout({ global: false, redirect: false });
        } catch {
          apiClient.clearSession();
        }
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
    }

    const session = apiClient.getStoredSession();
    const hasAccessToken = Boolean(session?.accessToken);

    if (!hasAccessToken) {
      const restored = await apiClient.restoreSessionFromCookie();
      if (!restored) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
    }

    try {
      const me = await apiClient.getMe();
      setIsAuthenticated(true);
      setUser(me);
    } catch {
      try {
        const restored = await apiClient.restoreSessionFromCookie();
        if (!restored) {
          apiClient.clearSession();
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const me = await apiClient.getMe();
        setIsAuthenticated(true);
        setUser(me);
      } catch {
        apiClient.clearSession();
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  const loginWithSsoRedirect = useCallback(async () => {
    const authorizeUrl = await apiClient.prepareSsoAuthorizeUrl();
    window.location.assign(authorizeUrl);
  }, []);

  const loginWithPassword = useCallback(async (usernameOrEmail, password) => {
    const session = await apiClient.login({ usernameOrEmail, password });
    const me = session?.user ?? await apiClient.getMe();
    setIsAuthenticated(true);
    setUser(me);
    return me;
  }, []);

  const completeSsoLogin = useCallback(async (code, state) => {
    const session = await apiClient.exchangeSsoCode({ code, state });
    const me = session?.user ?? await apiClient.getMe();
    setIsAuthenticated(true);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async (options = {}) => {
    const { global = true } = options;
    await apiClient.logout({ global, redirect: global });
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const refreshMe = useCallback(() => bootstrap(), []);

  const role = normalizeRole(user);
  const value = useMemo(
    () => ({
      loading,
      isAuthenticated,
      user,
      role,
      hasRole: (roles) => roles.map((item) => item.toLowerCase()).includes(role),
      loginWithPassword,
      loginWithSsoRedirect,
      completeSsoLogin,
      logout,
      refreshMe,
    }),
    [loading, isAuthenticated, user, role, loginWithPassword, loginWithSsoRedirect, completeSsoLogin, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}
