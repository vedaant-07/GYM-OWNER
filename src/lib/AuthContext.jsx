import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { tokenStore, userStore } from '@/lib/api-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({ id: 'se7enfit-owner', public_settings: { auth_required: true } });

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    const token = tokenStore.get();
    const cachedUser = userStore.get();

    if (cachedUser) {
      setUser(cachedUser);
      setIsAuthenticated(Boolean(token));
    }

    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      tokenStore.clear();
      userStore.clear();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: error.message || 'Authentication required' });
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const applyAuthResult = (result) => {
    const nextUser = result.user || userStore.get();
    setUser(nextUser);
    setIsAuthenticated(true);
    setAuthError(null);
    return result;
  };

  const login = async (email, password) => {
    const result = await base44.auth.loginViaEmailPassword(email, password);
    return applyAuthResult(result);
  };

  const loginWithGoogleCredential = async (idToken) => {
    const result = await base44.auth.loginWithGoogleCredential(idToken);
    return applyAuthResult(result);
  };

  const register = async (payload) => {
    const result = await base44.auth.register(payload);
    const nextUser = result.user || userStore.get();
    setUser(nextUser);
    setIsAuthenticated(Boolean(tokenStore.get()));
    setAuthError(null);
    return result;
  };

  const logout = async (shouldRedirect = true) => {
    await base44.auth.logout().catch(() => null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    if (shouldRedirect) window.location.href = '/login';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      login,
      loginWithGoogleCredential,
      register,
      logout,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
