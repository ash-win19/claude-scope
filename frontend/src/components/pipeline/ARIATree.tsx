import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { ARIANode } from '@/store/sessionStore';

interface ARIATreeProps {
  nodes: ARIANode[];
  diffOnly?: boolean;
  depth?: number;
}

const diffColor: Record<string, string> = {
  added: 'var(--cs-diff-added)',
  changed: 'var(--cs-diff-changed)',
  removed: 'var(--cs-diff-removed)',
};

const diffLabel: Record<string, string> = {
  added: '+',
  changed: '~',
  removed: '-',
};

const ARIATreeNode: React.FC<{ node: ARIANode; depth: number; diffOnly: boolean }> = ({ node, depth, diffOnly }) => {
  const [expanded, setExpanded] = useState(depth < 3);
  const hasChildren = node.children && node.children.length > 0;

  if (diffOnly && !node.diffStatus && !hasChildren) return null;
  // In diff mode, check if any descendant has a diff
  if (diffOnly && !node.diffStatus) {
    const hasDiffDescendant = (n: ARIANode): boolean => {
      if (n.diffStatus) return true;
      return n.children?.some(hasDiffDescendant) || false;
    };
    if (!hasDiffDescendant(node)) return null;
  }

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div
        className="flex items-center gap-1 py-0.5 cursor-pointer font-mono text-xs leading-relaxed"
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{ color: 'var(--cs-text-secondary)' }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
        ) : (
          <span className="w-3" />
        )}
        <span style={{ color: 'var(--cs-text-muted)' }}>[{node.role}]</span>
        <span className="ml-1">"{node.name}"</span>
        {node.diffStatus && (
          <span className="ml-auto flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: diffColor[node.diffStatus] }} />
            <span className="font-mono text-[10px]" style={{ color: diffColor[node.diffStatus] }}>
              {diffLabel[node.diffStatus]}
            </span>
          </span>
        )}
      </div>
      {expanded && hasChildren && node.children!.map((child, i) => (
        <ARIATreeNode key={i} node={child} depth={depth + 1} diffOnly={diffOnly} />
      ))}
    </div>
  );
};

export const ARIATree: React.FC<ARIATreeProps> = ({ nodes, diffOnly = false }) => (
  <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
    {nodes.map((node, i) => (
      <ARIATreeNode key={i} node={node} depth={0} diffOnly={diffOnly} />
    ))}
  </div>
);
