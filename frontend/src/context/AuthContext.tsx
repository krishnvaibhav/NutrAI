import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { apiCall } from '../api';

interface AuthContextType {
  currentUser: User | null;
  userTier: 'free' | 'pro';
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userTier: 'free',
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTier, setUserTier] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const sub = await apiCall('GET', '/payments/subscription');
          setUserTier(sub?.tier === 'pro' ? 'pro' : 'free');
        } catch {
          setUserTier('free');
        }
      } else {
        setUserTier('free');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userTier, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
