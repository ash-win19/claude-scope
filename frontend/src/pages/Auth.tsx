import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { CSSkeleton } from '@/components/ui/CSSkeleton';

const Auth: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
      return;
    }
    if (!isLoading) {
      loginWithRedirect();
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, navigate]);

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
