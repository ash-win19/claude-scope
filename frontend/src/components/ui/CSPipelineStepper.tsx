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
          {/* Step indicator + label */}
          <div className="flex flex-col items-center gap-1.5">
            {/* Pill-shaped indicator for active, circle for others */}
            <div className="relative flex items-center justify-center">
              {/* Glow ring for active step */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full animate-cs-pulse"
                  style={{
                    boxShadow: `0 0 12px 3px ${step.color}40`,
                    width: '100%',
                    height: '100%',
                  }}
                />
              )}
              <div
                className="relative flex items-center justify-center transition-all duration-300"
                style={{
                  width: isActive ? '28px' : '22px',
                  height: isActive ? '28px' : '22px',
                  borderRadius: '9999px',
                  backgroundColor: isCompleted
                    ? 'var(--cs-success)'
                    : isActive
                      ? step.color
                      : 'var(--cs-bg-overlay)',
                  boxShadow: isActive
                    ? `0 0 0 3px ${step.color}30`
                    : isCompleted
                      ? '0 0 0 2px rgba(74, 222, 128, 0.2)'
                      : 'none',
                }}
              >
                {isCompleted ? (
                  <Check size={12} strokeWidth={3} color="white" />
                ) : isActive ? (
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-white"
                    style={{ opacity: 0.95 }}
                  />
                ) : (
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--cs-text-muted)' }}
                  />
                )}
              </div>
            </div>
            {/* Label */}
            <span
              className="text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap hidden sm:block transition-colors duration-200"
              style={{
                color: isActive
                  ? step.color
                  : isCompleted
                    ? 'var(--cs-text-secondary)'
                    : 'var(--cs-text-muted)',
              }}
            >
              {step.label}
            </span>
          </div>
          {/* Connecting line */}
          {i < steps.length - 1 && (
            <div
              className="relative mx-1.5 sm:mx-2.5 overflow-hidden"
              style={{
                width: '40px',
                height: '2px',
                backgroundColor: 'var(--cs-border-subtle)',
                borderRadius: '1px',
              }}
            >
              {/* Filled portion for completed steps */}
              <div
                className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                style={{
                  width: isCompleted ? '100%' : '0%',
                  backgroundColor: 'var(--cs-success)',
                  borderRadius: '1px',
                }}
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);
