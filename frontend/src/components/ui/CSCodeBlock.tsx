import React, { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

interface CSCodeBlockProps {
  content: string;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  maxHeight?: number;
  className?: string;
}

export const CSCodeBlock: React.FC<CSCodeBlockProps> = ({
  content,
  showLineNumbers = true,
  copyable = true,
  maxHeight = 480,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = content.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border overflow-hidden ${className}`}
      style={{
        backgroundColor: 'var(--cs-bg-raised)',
        borderColor: 'var(--cs-border-subtle)',
      }}
    >
      {copyable && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
          style={{
            backgroundColor: 'var(--cs-bg-overlay)',
            color: copied ? 'var(--cs-success)' : 'var(--cs-text-secondary)',
            border: `1px solid var(--cs-border-default)`,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      )}
      <div
        className="overflow-y-auto p-4"
        style={{ maxHeight }}
      >
        <pre className="font-mono text-[13px] leading-[1.7]" style={{ color: 'var(--cs-text-primary)' }}>
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span
                    className="select-none inline-block w-8 shrink-0 text-right pr-3 border-r mr-3"
                    style={{
                      color: 'var(--cs-text-muted)',
                      borderColor: 'var(--cs-border-subtle)',
                    }}
                  >
                    {i + 1}
                  </span>
                )}
                <span className="flex-1 whitespace-pre-wrap break-all">{line || '\n'}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
