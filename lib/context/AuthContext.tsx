"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  tier: string;
}

interface SignupResult {
  userId: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<SignupResult | undefined>;
  refreshAuthState: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Shared function to update auth state from API response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateAuthState = (data: any) => {
    if (data.authenticated && data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Function to refresh the auth token
  const refreshToken = async (): Promise<boolean> => {
    // Get the current refresh token value directly from sessionStorage
    // This ensures we always use the latest value, not the one captured in the closure
    const currentRefreshToken =
      typeof window !== "undefined"
        ? sessionStorage.getItem("audiocloud_refresh_token")
        : null;

    if (!currentRefreshToken) {
      return false;
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
    }
  };

  // Function to fetch and update auth state
  const refreshAuthState = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/status");
      const data = await response.json();

      const currentRefreshToken =
        typeof window !== "undefined"
          ? sessionStorage.getItem("audiocloud_refresh_token")
          : null;

      if (data.authenticated && data.user) {
        updateAuthState(data);
      } else if (currentRefreshToken) {
        // If status check fails but we have a refresh token, try to refresh
        const refreshSuccessful = await refreshToken();

        if (!refreshSuccessful) {
          // If refresh failed too, clear auth state
          setUser(null);
          setIsAuthenticated(false);

          // Also clear from sessionStorage directly
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("audiocloud_refresh_token");
          }
        }
      } else {
        // No refresh token or status check failed
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    refreshAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the refresh token
      if (data.refreshToken) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("audiocloud_refresh_token", data.refreshToken);
        }
      }

      // If login response includes user data, use it directly
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        // Otherwise refresh the auth state to get user data
        await refreshAuthState();
      }

      return true; // Return success status
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setUser(null);
      setIsAuthenticated(false);

      // Also clear directly from sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("audiocloud_refresh_token");
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<SignupResult | undefined> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Return the user ID if available
      if (data.userId) {
        return { userId: data.userId };
      }

      return undefined;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    signup,
    refreshAuthState,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
