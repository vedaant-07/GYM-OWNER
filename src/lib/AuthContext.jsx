import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { tokenStore, userStore } from '@/lib/api-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({ id: 'se7enfit-owner', public_settings: { auth_required: true } });

  const checkUserAuth = useCallback(async ({ background = false } = {}) => {
    const token = tokenStore.get();
    const cachedUser = userStore.get();

    if (cachedUser && token) {
      setUser(cachedUser);
      setIsAuthenticated(true);
      setAuthError(null);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      if (!background) {
        base44.auth.me().then((currentUser) => {
          setUser(currentUser);
          userStore.set(currentUser);
        }).catch((error) => {
          console.warn('SE7EN FIT owner session revalidation failed:', error?.message || error);
        });
      }
      return;
    }

    setIsLoadingAuth(true);
    setAuthError(null);

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
      userStore.set(currentUser);
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
  }, []);

  useEffect(() => { checkUserAuth(); }, [checkUserAuth]);

  const applyAuthResult = (result) => {
    if (result?.requires_otp && !result?.access_token) {
      setIsAuthenticated(false);
      setAuthError(null);
      return result;
    }
    const nextUser = result?.user || userStore.get();
    if (nextUser) userStore.set(nextUser);
    setUser(nextUser);
    setIsAuthenticated(Boolean(result?.access_token || tokenStore.get()));
    setIsLoadingAuth(false);
    setAuthChecked(true);
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
    tokenStore.clear();
    userStore.clear();
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
