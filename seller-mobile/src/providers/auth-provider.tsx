import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
  } from 'react';
  import { Platform } from 'react-native';
  import * as SecureStore from 'expo-secure-store';
  
  import { apiRequest } from '@/lib/api';
  
  type User = {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
  };
  
  type StoredSession = {
    accessToken: string;
    expiresAtUtc: string;
  };
  
  type Session = StoredSession & {
    user: User;
  };
  
  type AuthContextValue = {
    session: Session | null;
    loading: boolean;
    error: string;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
  };
  
  const STORAGE_KEY = 'commercehub.seller.session';

  const AuthContext = createContext<AuthContextValue | null>(null);
  
  async function saveSession(session: StoredSession | null) {
    // Browser sessions stay in memory for this initial implementation.
    if (Platform.OS === 'web') return;
  
    if (session) {
      await SecureStore.setItemAsync(
        STORAGE_KEY,
        JSON.stringify({
          accessToken: session.accessToken,
          expiresAtUtc: session.expiresAtUtc,
        }),
      );
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  }
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
  
    const signOut = useCallback(async () => {
      setSession(null);
  
      try {
        await saveSession(null);
      } catch {
        setError('Signed out, but saved session cleanup failed.');
      }
    }, []);
  
    useEffect(() => {
      let cancelled = false;
  
      async function restoreSession() {
        try {
          if (Platform.OS === 'web') return;
  
          const saved = await SecureStore.getItemAsync(STORAGE_KEY);
          if (!saved) return;
  
          const stored = JSON.parse(saved) as StoredSession;
          const expiresAt = Date.parse(stored.expiresAtUtc);
  
          if (
            !stored.accessToken ||
            !Number.isFinite(expiresAt) ||
            expiresAt <= Date.now()
          ) {
            await saveSession(null);
            return;
          }
  
          const user = await apiRequest<User>(
            '/api/auth/me',
            {},
            stored.accessToken,
          );
          
          if (!user.roles.includes('Vendor')) {
            await saveSession(null);
          
            if (!cancelled) {
              setError('This account no longer has seller access.');
            }
          
            return;
          }
          
          if (!cancelled) {
            setSession({ ...stored, user });
          }
        } catch {
          if (!cancelled) {
            setError(
              'Could not restore your session. Check your connection and sign in again.',
            );
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
  
      void restoreSession();
  
      return () => {
        cancelled = true;
      };
    }, []);
  
    useEffect(() => {
      if (!session) return;
  
      const remaining = Date.parse(session.expiresAtUtc) - Date.now();
  
      if (remaining <= 0) {
        void signOut();
        return;
      }
  
      const timeout = setTimeout(() => {
        void signOut();
      }, remaining);
  
      return () => clearTimeout(timeout);
    }, [session, signOut]);
  
    async function signIn(email: string, password: string) {
    setError('');

    const result = await apiRequest<Session>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
        email: email.trim(),
        password,
        }),
    });

    if (!result.user.roles.includes('Vendor')) {
        throw new Error(
        'This account does not have seller access. Please register as a seller first.',
        );
    }

    const expiresAt = Date.parse(result.expiresAtUtc);

    if (!result.accessToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        throw new Error('The server returned an invalid session. Please try again.');
    }

    await saveSession(result);
    setSession(result);
    }
  
    return (
      <AuthContext.Provider
        value={{ session, loading, error, signIn, signOut }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error('useAuth must be used inside AuthProvider.');
    }
  
    return context;
  }