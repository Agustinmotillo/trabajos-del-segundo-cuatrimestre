import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE } from '../config';

type Role = 'CLIENTE' | 'RECEPCIONISTA' | 'VETERINARIO';
type User = { id: number; name: string; email: string; role: Role };

type Ctx = {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
};

const C = createContext<Ctx>(null as any);
export const useAuth = () => useContext(C);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // ---- Helpers de storage
  const readStorage = () => {
    try {
      const saved = localStorage.getItem('auth');
      if (saved) {
        const o = JSON.parse(saved);
        if (o?.user && o?.token) return { user: o.user as User, token: String(o.token) };
      }
      // fallback (por si en algún momento guardamos separados)
      const t = localStorage.getItem('token');
      const u = localStorage.getItem('user');
      if (t && u) return { user: JSON.parse(u) as User, token: t };
    } catch {}
    return { user: null, token: null };
  };

  const writeStorage = (u: User | null, t: string | null) => {
    if (u && t) {
      localStorage.setItem('auth', JSON.stringify({ user: u, token: t }));
      // conveniencia (para pruebas manuales en consola)
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('token', t);
    } else {
      localStorage.removeItem('auth');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  // ---- Hidratar sesión al cargar
  useEffect(() => {
    const { user, token } = readStorage();
    if (user && token) {
      setUser(user);
      setToken(token);
    }
    setHydrated(true);
  }, []);

  const persist = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    writeStorage(u, t);
  };

  const login = async (email: string, password: string) => {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!d.ok) throw new Error(d.message || 'Login fallido');
    persist(d.user, d.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const d = await r.json();
    if (!d.ok) throw new Error(d.message || 'Registro fallido');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    writeStorage(null, null);
  };

  // ---- fetch autenticado (incluye Bearer y maneja 401)
  const authFetch = async (input: string, init: RequestInit = {}) => {
    // si todavía no hidratamos, intento leer token directo del storage
    const t = token ?? readStorage().token;

    const headers = {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };

    const res = await fetch(`${API_BASE}${input}`, {
      ...init,
      headers,
    });

    if (res.status === 401) {
      // token inválido / vencido → limpiar y que RootNavigator muestre Login
      logout();
    }

    return res;
  };

  return (
    <C.Provider
      value={{ user, token, hydrated, login, register, logout, authFetch }}
    >
      {children}
    </C.Provider>
  );
}
