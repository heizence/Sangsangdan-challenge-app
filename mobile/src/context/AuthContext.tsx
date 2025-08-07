import React from "react";
import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  token: string | null;
  userId: number | null;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("user_token");
        if (storedToken) {
          const decoded: { sub: number } = jwtDecode(storedToken);
          setToken(storedToken);
          setUserId(decoded.sub);
        }
      } catch (e) {
        console.error("Failed to load token from storage", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (newToken: string) => {
    try {
      await AsyncStorage.setItem("user_token", newToken);
      const decoded: { sub: number } = jwtDecode(newToken);
      setToken(newToken);
      setUserId(decoded.sub);
    } catch (e) {
      console.error("Failed to save token to storage", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user_token");
      setToken(null);
      setUserId(null);
    } catch (e) {
      console.error("Failed to remove token from storage", e);
    }
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
