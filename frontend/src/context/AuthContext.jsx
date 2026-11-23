import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { AUTH_TOKEN_KEY } from '../services/api';

export const AuthContext = createContext(null);

const ONBOARDING_KEY = 'bellezza_onboarding_done';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  // Restore authenticated session & onboarding flag on mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const [savedToken, onboardingFlag] = await Promise.all([
          storage.get(AUTH_TOKEN_KEY),
          storage.get(ONBOARDING_KEY),
        ]);

        if (isMounted) {
          setHasSeenOnboarding(onboardingFlag === 'true');
        }

        if (savedToken) {
          try {
            // Verify token with backend
            const profile = await authService.getProfile();
            if (isMounted) {
              setToken(savedToken);
              setUser(profile);
            }
          } catch (err) {
            // Token invalid or expired: clear local storage
            console.warn('[AuthContext] Stored token invalid or expired:', err.message);
            await storage.remove(AUTH_TOKEN_KEY);
            if (isMounted) {
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Session restore error:', err.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Register a new account, securely persist token, and set state
   */
  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      const { user: newUser, token: newToken } = await authService.register(name, email, password);
      await storage.set(AUTH_TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log in user, securely persist token, and set state
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const { user: authUser, token: newToken } = await authService.login(email, password);
      await storage.set(AUTH_TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(authUser);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out user, notify server, remove secure token, and clear state
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout().catch(() => null);
    } finally {
      await storage.remove(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  /**
   * Refresh authenticated user profile from backend
   */
  const refreshUser = useCallback(async () => {
    try {
      const updated = await authService.getProfile();
      setUser(updated);
      return updated;
    } catch (err) {
      if (err.status === 401) {
        await storage.remove(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
      throw err;
    }
  }, []);

  /**
   * Update basic profile fields
   */
  const updateProfile = useCallback(async (data) => {
    try {
      const updated = await userService.updateProfile(data);
      setUser(updated);
      return updated;
    } catch (err) {
      // Fallback: update local state if server unavailable
      setUser((prev) => ({ ...prev, ...data }));
      throw err;
    }
  }, []);

  /**
   * Update clinical skin profile
   */
  const updateSkinProfile = useCallback(async (skinData) => {
    try {
      const updated = await userService.updateSkinProfile(skinData);
      setUser(updated);
      return updated;
    } catch (err) {
      setUser((prev) => ({
        ...prev,
        skinProfile: { ...prev?.skinProfile, ...skinData },
      }));
      throw err;
    }
  }, []);

  /**
   * Complete onboarding
   */
  const completeOnboarding = useCallback(async () => {
    try {
      await storage.set(ONBOARDING_KEY, 'true');
    } catch {}
    setHasSeenOnboarding(true);
  }, []);

  /**
   * Saved items management
   */
  const toggleSavedProduct = useCallback((productId) => {
    setUser((prev) => {
      const saved = prev?.savedProducts || [];
      const updated = saved.includes(productId)
        ? saved.filter((id) => id !== productId)
        : [...saved, productId];
      return { ...prev, savedProducts: updated };
    });
  }, []);

  const toggleSavedIngredient = useCallback((ingredientId) => {
    setUser((prev) => {
      const saved = prev?.savedIngredients || [];
      const updated = saved.includes(ingredientId)
        ? saved.filter((id) => id !== ingredientId)
        : [...saved, ingredientId];
      return { ...prev, savedIngredients: updated };
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    loading: isLoading, // backwards compatibility alias
    hasSeenOnboarding,
    register,
    login,
    logout,
    updateProfile,
    updateSkinProfile,
    refreshUser,
    completeOnboarding,
    toggleSavedProduct,
    toggleSavedIngredient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const useAuthContext = useAuth;

export default AuthContext;

