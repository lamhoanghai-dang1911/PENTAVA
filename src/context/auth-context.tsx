import { authService } from '@/src/services/authService';
import { getAccessToken, restoreAccessToken } from '@/src/services/apiClient';
import { subscribeAuthState } from '@/src/services/authStorage';
import { useCallback, useContext, useEffect, useMemo, useState, createContext, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  markAuthenticated: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeAuthState((userId) => {
      if (active) {
        setStatus(userId ? 'authenticated' : 'unauthenticated');
      }
    });

    const restoreSession = async () => {
      try {
        const token = await restoreAccessToken();
        if (!token) {
          if (active) setStatus('unauthenticated');
          return;
        }

        try {
          await authService.getProfile();
          if (active) setStatus('authenticated');
        } catch (error) {
          if (!getAccessToken()) {
            if (active) setStatus('unauthenticated');
            return;
          }

          console.warn(
            'Could not validate the saved session; keeping it available for retry.',
            error,
          );
          if (active) setStatus('authenticated');
        }
      } catch (error) {
        console.error('Unable to restore the saved authentication session.', error);
        if (active) setStatus('unauthenticated');
      }
    };

    void restoreSession();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const markAuthenticated = useCallback(() => {
    setStatus('authenticated');
  }, []);

  const value = useMemo(
    () => ({ status, markAuthenticated }),
    [status, markAuthenticated],
  );

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
