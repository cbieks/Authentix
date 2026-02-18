import { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken as persistToken } from '../api/client'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authentix_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api('/api/users/me')
      .then(setUser)
      .catch(() => persistToken(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (email, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    persistToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password, displayName) => {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName: displayName || undefined }),
    });
    persistToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await api('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    setUser(updated);
    return updated;
  };

  const refetchUser = async () => {
    const u = await api('/api/users/me');
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
