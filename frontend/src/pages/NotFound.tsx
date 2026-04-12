import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CSButton } from '@/components/ui/CSButton';
import { CSMonoLabel } from '@/components/ui/CSMonoLabel';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
      <CSMonoLabel>ERROR</CSMonoLabel>
      <span className="font-mono text-7xl mt-2" style={{ color: 'var(--cs-text-muted)' }}>404</span>
      <p className="text-sm mt-4" style={{ color: 'var(--cs-text-secondary)' }}>This page doesn't exist.</p>
      <CSButton variant="primary" className="mt-6" onClick={() => navigate('/workspace')}>
        ← Go to Dashboard
      </CSButton>
    </div>
  );
};

export default NotFound;
