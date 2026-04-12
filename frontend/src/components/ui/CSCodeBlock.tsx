import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';

interface CSCodeBlockProps {
  content: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
  maxHeight?: number;
  className?: string;
}

let highlighterPromise: Promise<typeof import('shiki')['codeToHtml']> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then((mod) => mod.codeToHtml);
  }
  return highlighterPromise;
}

export const CSCodeBlock: React.FC<CSCodeBlockProps> = ({
  content,
  language = 'markdown',
  filename,
  showLineNumbers = true,
  copyable = true,
  maxHeight = 480,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => content.split('\n'), [content]);

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((codeToHtml) =>
        codeToHtml(content, {
          lang: language,
          theme: 'github-dark-default',
        })
      )
      .then((html) => {
        if (!cancelled) setHighlighted(html);
      })
      .catch(() => {
        if (!cancelled) setHighlighted(null);
      });
    return () => { cancelled = true; };
  }, [content, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineNumberGutter = showLineNumbers ? (
    <div
      className="absolute top-0 left-0 select-none text-right pt-4 pb-4 pr-2"
      style={{
        width: 52,
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        lineHeight: '1.65',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {lines.map((_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  ) : null;

  const bodyPaddingLeft = showLineNumbers ? 64 : 16;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{
        backgroundColor: '#0d1117',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <FileCode2 size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <span
            className="text-xs font-medium tracking-wide"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {filename || 'System Prompt'}
          </span>
        </div>
        {copyable && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: copied
                ? 'rgba(63, 185, 80, 0.15)'
                : 'rgba(255,255,255,0.06)',
              color: copied ? '#3fb950' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${copied ? 'rgba(63,185,80,0.25)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>

      {/* Code body */}
      <div className="overflow-auto" style={{ maxHeight }}>
        {highlighted ? (
          <div className="cs-code-highlighted relative">
            {lineNumberGutter}
            <div
              className="p-4"
              style={{ paddingLeft: bodyPaddingLeft }}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>
        ) : (
          <div className="relative">
            {lineNumberGutter}
            <pre
              className="p-4"
              style={{
                paddingLeft: bodyPaddingLeft,
                fontSize: 13,
                lineHeight: '1.65',
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                margin: 0,
              }}
            >
              <code className="whitespace-pre-wrap break-words">{content}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
