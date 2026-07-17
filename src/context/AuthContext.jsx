import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../lib/constants';
import { useData } from './DataContext';

const AuthContext = createContext(null);

const DEFAULT_MASTER = { userId: 'arpguptaa', password: '8090501107', name: 'Arpit Gupta' };

function loadMaster() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.master);
    return raw ? JSON.parse(raw) : DEFAULT_MASTER;
  } catch {
    return DEFAULT_MASTER;
  }
}

export function AuthProvider({ children }) {
  const { clients } = useData();
  const [master, setMaster] = useState(loadMaster);
  const [session, setSession] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.session);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => localStorage.setItem(STORAGE_KEYS.master, JSON.stringify(master)), [master]);
  useEffect(() => {
    if (session) sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEYS.session);
  }, [session]);

  const login = useCallback((userIdRaw, passwordRaw) => {
    const userId = userIdRaw.trim();
    const password = passwordRaw.trim();
    if (userId === master.userId && password === master.password) {
      setSession({ role: 'master' });
      return { ok: true, role: 'master' };
    }
    const client = clients.find((c) => c.userId === userId && c.password === password);
    if (client) {
      if (client.status === 'pending') {
        return { ok: false, error: 'Your account request is still awaiting activation. We will notify you once it is live.' };
      }
      setSession({ role: 'client', clientId: client.id });
      return { ok: true, role: 'client', clientId: client.id };
    }
    // Employee login — Employee ID (e.g. ORBIT01) + password (default: their PAN).
    for (const c of clients) {
      const employee = (c.org?.employees || []).find((e) => e.employeeId === userId && e.password === password);
      if (employee) {
        if (c.status === 'pending' || c.status === 'locked' || c.status === 'paused' || c.status === 'cancelled') {
          return { ok: false, error: "Your company's Teamify workspace isn't active right now. Please contact your HR/admin." };
        }
        setSession({ role: 'employee', clientId: c.id, employeeId: employee.id });
        return { ok: true, role: 'employee', clientId: c.id, employeeId: employee.id };
      }
    }
    return { ok: false, error: 'Incorrect user ID or password.' };
  }, [master, clients]);

  const logout = useCallback(() => setSession(null), []);

  // User ID is fixed at creation — this only ever updates the password.
  const updateMasterPassword = useCallback((newPassword) => setMaster((prev) => ({ ...prev, password: newPassword })), []);
  const updateMasterName = useCallback((name) => setMaster((prev) => ({ ...prev, name })), []);

  const currentClient = session?.role === 'client'
    ? clients.find((c) => c.id === session.clientId) || null
    : session?.role === 'employee'
    ? clients.find((c) => c.id === session.clientId) || null
    : null;

  const currentEmployee = session?.role === 'employee'
    ? (currentClient?.org?.employees || []).find((e) => e.id === session.employeeId) || null
    : null;

  const value = { session, master, login, logout, updateMasterPassword, updateMasterName, currentClient, currentEmployee };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
