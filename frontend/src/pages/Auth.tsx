import React, { useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { CSSkeleton } from '@/components/ui/CSSkeleton';

const Auth: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();
  const redirected = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/workspace');
      return;
    }
    if (!isLoading && !redirected.current && !error) {
      redirected.current = true;
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, navigate, error]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
        <div className="flex flex-col items-center gap-4 text-center" style={{ maxWidth: 400 }}>
          <p className="text-lg font-semibold" style={{ color: 'var(--cs-text-primary)' }}>Authentication Error</p>
          <p className="text-sm" style={{ color: 'var(--cs-text-muted)' }}>{error.message}</p>
          <button
            onClick={() => { redirected.current = false; loginWithRedirect(); }}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'var(--cs-accent)', color: 'white' }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
      <div className="flex flex-col items-center gap-4">
        <CSSkeleton width={200} height={24} />
        <p className="text-sm" style={{ color: 'var(--cs-text-muted)' }}>Redirecting to login...</p>
      </div>
    </div>
  );
};

export default Auth;
