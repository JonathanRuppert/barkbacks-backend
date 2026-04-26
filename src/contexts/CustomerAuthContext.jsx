import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const CustomerAuthContext = createContext(null);

const CUSTOMER_TOKEN_KEY = 'barkbacks_customer_token';
const CUSTOMER_USER_KEY = 'barkbacks_customer_user';

export function CustomerAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(CUSTOMER_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(CUSTOMER_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/api/customer/auth/profile', { token });
        if (!active) return;
        setUser(data.customer);
        localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(data.customer));
      } catch (error) {
        if (!active) return;
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [token]);

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(CUSTOMER_TOKEN_KEY, nextToken);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(nextUser));
  };

  const login = async (credentials) => {
    const data = await apiRequest('/api/customer/auth/login', {
      method: 'POST',
      body: credentials,
    });
    persistSession(data.token, data.customer);
    return data;
  };

  const register = async (profile) => {
    const data = await apiRequest('/api/customer/auth/register', {
      method: 'POST',
      body: profile,
    });
    persistSession(data.token, data.customer);
    return data;
  };

  const updateProfile = async (profile) => {
    const data = await apiRequest('/api/customer/auth/profile', {
      method: 'PUT',
      body: profile,
      token,
    });
    setUser(data.customer);
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(data.customer));
    return data;
  };

  const logout = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    updateProfile,
    logout,
  }), [loading, token, user]);

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
