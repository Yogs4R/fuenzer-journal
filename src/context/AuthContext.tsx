import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  auth,
  googleProvider,
  workspaceGoogleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from '../lib/firebase';
import {
  setCachedAccessToken,
  getCachedAccessToken,
  clearCachedAccessToken,
} from '../lib/google-workspace';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  clearError: () => void;
  getWorkspaceToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('fuenzer_guest_mode') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setIsGuest(false);
          localStorage.removeItem('fuenzer_guest_mode');
        } else {
          clearCachedAccessToken();
        }
        setLoading(false);
      },
      (authErr) => {
        console.error('Auth state error:', authErr);
        setError(authErr.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('fuenzer_guest_mode', 'true');
  };

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedAccessToken(credential.accessToken);
      }
      setIsGuest(false);
      localStorage.removeItem('fuenzer_guest_mode');
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      // Suppress popup-closed-by-user error message nicely
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        if (err.code === 'auth/internal-error') {
          setError(
            'Google Sign-In internal error: Please verify that this domain is added in Firebase Console (Authentication > Settings > Authorized Domains) and Google Cloud OAuth Client Credentials (Authorized JavaScript origins).'
          );
        } else {
          setError(err.message || 'Failed to sign in with Google. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getWorkspaceToken = async (): Promise<string> => {
    const existing = getCachedAccessToken();
    if (existing) {
      return existing;
    }

    // Interactive token request if not in memory
    const result = await signInWithPopup(auth, workspaceGoogleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not acquire Google Workspace access token.');
    }
    setCachedAccessToken(credential.accessToken);
    return credential.accessToken;
  };

  const signOut = async () => {
    setError(null);
    try {
      clearCachedAccessToken();
      if (user) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setIsGuest(false);
      localStorage.removeItem('fuenzer_guest_mode');
    } catch (err: any) {
      console.error('Sign-out error:', err);
      setError('Failed to sign out cleanly.');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isGuest,
        signInWithGoogle,
        continueAsGuest,
        signOut,
        clearError,
        getWorkspaceToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
