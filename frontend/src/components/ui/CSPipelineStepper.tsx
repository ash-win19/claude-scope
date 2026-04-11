import React from 'react';
import { Check } from 'lucide-react';

interface PipelineStep {
  label: string;
  color: string;
}

interface CSPipelineStepperProps {
  steps: PipelineStep[];
  currentStep: number;
}

export const CSPipelineStepper: React.FC<CSPipelineStepperProps> = ({ steps, currentStep }) => (
  <div className="flex items-center gap-0">
    {steps.map((step, i) => {
      const isCompleted = i < currentStep;
      const isActive = i === currentStep;
      const isPending = i > currentStep;

      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-150"
              style={{
                backgroundColor: isCompleted
                  ? 'var(--cs-success)'
                  : isActive
                    ? step.color
                    : 'var(--cs-bg-overlay)',
              }}
            >
              {isCompleted && <Check size={10} strokeWidth={3} color="white" />}
            </div>
            <span
              className="text-[11px] font-medium whitespace-nowrap hidden sm:block"
              style={{
                color: isActive ? 'var(--cs-text-primary)' : isPending ? 'var(--cs-text-muted)' : 'var(--cs-text-secondary)',
              }}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-8 sm:w-12 h-px mx-1"
              style={{
                backgroundColor: isCompleted ? 'var(--cs-success)' : 'var(--cs-border-subtle)',
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
