"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken, setToken } from "@/lib/api";
import { User } from "@/types";

export function useAuth(requireAuth: boolean = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("bhasha_token");
        if (!token) {
          if (requireAuth) {
            router.push("/login");
          }
          setLoading(false);
          return;
        }

        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch (err: any) {
        clearToken();
        if (requireAuth) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [requireAuth, router]);

  const login = async (payload: { email: string; password: string }) => {
    setError(null);
    try {
      const res = await api.login(payload);
      setToken(res.access_token);
      const currentUser = await api.getMe();
      setUser(currentUser);
      router.push("/tutor");
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    full_name: string;
    preferred_language?: string;
    programming_language?: string;
  }) => {
    setError(null);
    try {
      await api.register(payload);
      // Auto login after registration
      await login({ email: payload.email, password: payload.password });
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
}

