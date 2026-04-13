import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CSButton } from '@/components/ui/CSButton';
import { CSPipelineStepper } from '@/components/ui/CSPipelineStepper';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { useSidebarStore } from '@/store/sidebarStore';

const PIPELINE_STEPS = [
  { label: 'Record', color: 'var(--cs-step-record)' },
  { label: 'Analyze', color: 'var(--cs-step-process)' },
  { label: 'Review', color: 'var(--cs-step-review)' },
  { label: 'Prompt', color: 'var(--cs-step-output)' },
];

interface PipelineShellProps {
  children: React.ReactNode;
  currentStep: number;
  rightAction?: React.ReactNode;
  maxWidth?: number;
  onExit?: () => void;
}

export const PipelineShell: React.FC<PipelineShellProps> = ({
  children,
  currentStep,
  rightAction,
  maxWidth = 1100,
  onExit,
}) => {
  const navigate = useNavigate();
  const collapsed = useSidebarStore((s) => s.collapsed);

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      navigate('/workspace');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
      <WorkspaceSidebar />
      <div
        className={`transition-[margin-left] duration-200 ${collapsed ? 'workspace-main-collapsed' : 'workspace-main-expanded'}`}
      >
        {/* Pipeline navigation bar */}
        <nav
          className="sticky top-0 z-30 h-14 flex items-center px-6 border-b"
          style={{
            backgroundColor: 'var(--cs-bg-surface)',
            borderColor: 'var(--cs-border-subtle)',
          }}
        >
          <CSButton variant="ghost" size="sm" onClick={handleExit} iconLeft={<ArrowLeft size={14} />}>
            Exit
          </CSButton>

          <div className="flex-1 flex justify-center">
            <CSPipelineStepper steps={PIPELINE_STEPS} currentStep={currentStep} />
          </div>

          <div className="ml-auto">
            {rightAction}
          </div>
        </nav>

        <main className="mx-auto w-full py-10 px-6 sm:px-8 lg:px-10" style={{ maxWidth }}>
          {children}
        </main>
      </div>
    </div>
  );
};
