import { createContext, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

type Product = {
  _id: string;
  title: string;
  price: number;
  description: string;
  image: string;
};

type ProductsResponse = {
  products: Product[];
  total: number;
};

type AppContextType = {
  token: string | null;
  userName: string;
  favorites: string[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProducts: (page: number, limit: number, search: string) => Promise<ProductsResponse>;
  fetchProductById: (id: string) => Promise<Product | null>;
  toggleFavorite: (productId: string) => Promise<void>;
  syncMe: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

const LAN_API_URL = 'http://192.168.1.39:5000';
const EMULATOR_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const USE_EMULATOR = process.env.EXPO_PUBLIC_USE_EMULATOR === 'true';
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (USE_EMULATOR ? EMULATOR_API_URL : LAN_API_URL);

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error: any) {
    clearTimeout(timeout);
    if (error?.name === 'AbortError') {
      throw new Error(`Network timeout. Check backend at ${API_URL}`);
    }
    throw new Error(`Network request failed. Check backend at ${API_URL}`);
  }

  clearTimeout(timeout);

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data as T;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const syncMe = async () => {
    if (!token) {
      setUserName('');
      setFavorites([]);
      return;
    }

    const me = await apiRequest<{ name: string; favorites: string[] }>('/auth/me', {}, token);
    setUserName(me.name || '');
    setFavorites((me.favorites || []).map(String));
  };

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(data.token);

    const me = await apiRequest<{ name: string; favorites: string[] }>('/auth/me', {}, data.token);
    setUserName(me.name || '');
    setFavorites((me.favorites || []).map(String));
  };

  const register = async (name: string, email: string, password: string) => {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  };

  const logout = () => {
    setToken(null);
    setUserName('');
    setFavorites([]);
  };

  const fetchProducts = async (page: number, limit: number, search: string) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
    });
    return apiRequest<ProductsResponse>(`/products?${query.toString()}`);
  };

  const fetchProductById = async (id: string) => {
    return apiRequest<Product>(`/products/${id}`);
  };

  const toggleFavorite = async (productId: string) => {
    if (!token) throw new Error('Please login first.');

    const optimistic = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId];

    setFavorites(optimistic);

    try {
      const response = await apiRequest<{ favorites: string[] }>(
        `/products/favorite/${productId}`,
        { method: 'POST', body: JSON.stringify({}) },
        token
      );
      setFavorites((response.favorites || []).map(String));
    } catch (error) {
      setFavorites(favorites);
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      token,
      userName,
      favorites,
      login,
      register,
      logout,
      fetchProducts,
      fetchProductById,
      toggleFavorite,
      syncMe,
    }),
    [token, userName, favorites]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
