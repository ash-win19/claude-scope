import React from 'react';
import * as Switch from '@radix-ui/react-switch';

interface CSToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export const CSToggle: React.FC<CSToggleProps> = ({ checked, onCheckedChange, disabled, id }) => (
  <Switch.Root
    id={id}
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    className="relative inline-flex items-center h-[18px] w-8 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
    style={{
      backgroundColor: checked ? 'var(--cs-accent)' : 'var(--cs-bg-overlay)',
    }}
  >
    <Switch.Thumb
      className="block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-150"
      style={{
        transform: checked ? 'translateX(14px)' : 'translateX(2px)',
      }}
    />
  </Switch.Root>
);
