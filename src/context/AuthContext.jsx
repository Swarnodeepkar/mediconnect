import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useCollection } from '../data/store.js';

const AuthContext = createContext(null);
const SESSION_KEY = 'mediconnect_session_v1';

export function AuthProvider({ children }) {
  const users = useCollection('USERS');
  const [userId, setUserId] = useState(() => {
    try {
      return localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (userId) localStorage.setItem(SESSION_KEY, userId);
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, [userId]);

  const login = useCallback((id) => setUserId(id), []);
  const logout = useCallback(() => setUserId(null), []);

  const user = users.find((u) => u.id === userId) || null;

  return (
    <AuthContext.Provider value={{ user, users, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
