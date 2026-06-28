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

  useEffect(() => { checkUserAuth(); }, []);

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
    if (result?.requires_otp && !result?.access_token) {
      setIsAuthenticated(false);
      setAuthError(null);
      return result;
    }
    const nextUser = result?.user || userStore.get();
    setUser(nextUser);
    setIsAuthenticated(Boolean(result?.access_token || tokenStore.get()));
    setAuthError(null);
    return result;
  };

  const login = async (email, password) => applyAuthResult(await base44.auth.loginViaEmailPassword(email, password));
  const verifyOtp = async ({ email, token, purpose = 'login' }) => applyAuthResult(await base44.auth.verifyOtp({ email, token, purpose }));
  const resendOtp = async (email, purpose = 'login') => base44.auth.resendOtp(email, purpose);
  const loginWithGoogleCredential = async (idToken) => applyAuthResult(await base44.auth.loginWithGoogleCredential(idToken));
  const register = async (payload) => applyAuthResult(await base44.auth.register(payload));

  const logout = async (shouldRedirect = true) => {
    await base44.auth.logout().catch(() => null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    if (shouldRedirect) window.location.href = '/login';
  };

  const navigateToLogin = () => { window.location.href = '/login'; };

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
      verifyOtp,
      resendOtp,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
