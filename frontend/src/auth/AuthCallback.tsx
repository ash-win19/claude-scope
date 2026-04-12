import React, { useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthStore } from '@/store/authStore';
import { CSSkeleton } from '@/components/ui/CSSkeleton';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const AuthCallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const setAuth = useAuthStore((s) => s.setAuth);
  const synced = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || synced.current) return;
    synced.current = true;

    (async () => {
      const token = await getAccessTokenSilently();

      // Call backend /auth/me to find or create the user
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const backendUser = await res.json();

      setAuth(
        {
          id: backendUser.id,
          name: backendUser.name || user.name || '',
          email: backendUser.email || user.email || '',
          avatarUrl: user.picture,
        },
        token,
      );
    })();
  }, [isAuthenticated, user, getAccessTokenSilently, setAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
        <CSSkeleton width={200} height={24} />
        <CSSkeleton width={300} height={16} />
      </div>
    );
  }

  return <>{children}</>;
};
