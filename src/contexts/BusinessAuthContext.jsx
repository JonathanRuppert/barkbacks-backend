import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const TOKEN_KEY = 'barkbacks_business_token';
const DAYCARE_KEY = 'barkbacks_business_daycare';

const BusinessAuthContext = createContext(null);

export function BusinessAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [daycare, setDaycare] = useState(() => {
    const stored = localStorage.getItem(DAYCARE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = useCallback((nextToken, nextDaycare) => {
    setToken(nextToken);
    setDaycare(nextDaycare);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(DAYCARE_KEY, JSON.stringify(nextDaycare));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    persistSession(data.token, data.daycare);
    return data.daycare;
  }, [persistSession]);

  const register = useCallback(async ({ daycareName, email, password }) => {
    const data = await apiRequest('/api/daycare/register', {
      method: 'POST',
      body: { daycareName, email, password },
    });
    persistSession(data.token, data.daycare);
    return data.daycare;
  }, [persistSession]);

  const logout = useCallback(() => {
    setToken(null);
    setDaycare(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DAYCARE_KEY);
  }, []);

  useEffect(() => {
    if (!token) return;

    apiRequest('/api/auth/me', { token })
      .then((data) => {
        setDaycare(data.daycare);
        localStorage.setItem(DAYCARE_KEY, JSON.stringify(data.daycare));
      })
      .catch(() => logout());
  }, [logout, token]);

  const value = useMemo(() => ({
    daycare,
    token,
    login,
    register,
    logout,
    isAuthenticated: Boolean(token && daycare),
  }), [daycare, login, logout, register, token]);

  return (
    <BusinessAuthContext.Provider value={value}>
      {children}
    </BusinessAuthContext.Provider>
  );
}

export function useBusinessAuth() {
  const context = useContext(BusinessAuthContext);

  if (!context) {
    throw new Error('useBusinessAuth must be used inside a BusinessAuthProvider');
  }

  return context;
}
