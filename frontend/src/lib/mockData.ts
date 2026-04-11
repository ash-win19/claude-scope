import type { Session, Frame, ARIANode } from '@/store/sessionStore';

const makeAriaTree = (): ARIANode[] => [
  {
    role: 'navigation',
    name: 'Main navigation',
    children: [
      { role: 'link', name: 'Dashboard', diffStatus: 'changed' },
      { role: 'link', name: 'Settings' },
      { role: 'link', name: 'Profile', diffStatus: 'added' },
    ],
  },
  {
    role: 'main',
    name: 'Page content',
    children: [
      {
        role: 'heading',
        name: 'Welcome back',
        children: [],
      },
      {
        role: 'region',
        name: 'Stats cards',
        diffStatus: 'changed',
        children: [
          { role: 'article', name: 'Total users: 1,234' },
          { role: 'article', name: 'Revenue: $12.5k', diffStatus: 'added' },
        ],
      },
      {
        role: 'table',
        name: 'Recent activity',
        diffStatus: 'removed',
        children: [
          { role: 'row', name: 'User signed up — 2 min ago' },
          { role: 'row', name: 'Payment received — 5 min ago' },
        ],
      },
    ],
  },
];

const makeFrames = (count: number): Frame[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `frame_${String(i + 1).padStart(2, '0')}`,
    timestamp: i * 3.5,
    url: i % 2 === 0 ? '/dashboard' : '/dashboard/settings',
    thumbnailUrl: `https://picsum.photos/seed/cs${i}/320/224`,
    diffSummary: {
      added: Math.floor(Math.random() * 5),
      changed: Math.floor(Math.random() * 8) + 1,
      removed: Math.floor(Math.random() * 3),
    },
    ariaTree: makeAriaTree(),
  }));

const MOCK_PROMPT = `# System Prompt — Dashboard Bug Fix

## Context
You are editing a React + TypeScript web application. The user has recorded their screen showing a bug in the dashboard dropdown menu.

## Current State
The dashboard page at \`/dashboard\` contains:
- A top navigation bar with dropdown menus
- A stats grid showing 3 metric cards
- A recent activity table

## Observed Bug
When hovering over the "Settings" dropdown in the navigation:
1. The dropdown opens correctly
2. Moving the mouse to dropdown items causes the menu to close prematurely
3. The hover state on the trigger button remains active after close

## Component Tree (ARIA Snapshot)
\`\`\`
[navigation] "Main navigation"
  [link] "Dashboard"
  [link] "Settings" (changed)
  [link] "Profile" (added)
[main] "Page content"
  [heading] "Welcome back"
  [region] "Stats cards" (changed)
    [article] "Total users: 1,234"
    [article] "Revenue: $12.5k" (added)
  [table] "Recent activity" (removed)
\`\`\`

## Instructions
Fix the dropdown hover behavior in the navigation component. The menu should remain open while the cursor is within the dropdown boundary. Ensure the trigger button's hover state resets on menu close.

## Files to Modify
- \`src/components/Navigation.tsx\`
- \`src/components/DropdownMenu.tsx\`
`;

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess_01HX8Y',
    title: 'Dashboard dropdown hover bug',
    status: 'complete',
    duration: 45,
    frameCount: 12,
    urls: ['/dashboard', '/dashboard/settings'],
    createdAt: '2024-03-15T10:30:00Z',
    processingTime: 18,
    prompt: MOCK_PROMPT,
    frames: makeFrames(12),
  },
  {
    id: 'sess_02KZ9A',
    title: 'Form validation not triggering',
    status: 'complete',
    duration: 62,
    frameCount: 8,
    urls: ['/signup', '/signup/verify'],
    createdAt: '2024-03-14T16:45:00Z',
    processingTime: 22,
    prompt: MOCK_PROMPT.replace('Dashboard', 'Signup Form').replace('dropdown', 'validation'),
    frames: makeFrames(8),
  },
  {
    id: 'sess_03LM1B',
    title: 'Modal z-index overlap on mobile',
    status: 'processing',
    duration: 30,
    frameCount: 5,
    urls: ['/settings'],
    createdAt: '2024-03-14T09:12:00Z',
    processingTime: 0,
    prompt: '',
    frames: makeFrames(5),
  },
  {
    id: 'sess_04NP2C',
    title: 'Chart tooltip clipping at edges',
    status: 'complete',
    duration: 28,
    frameCount: 6,
    urls: ['/analytics', '/analytics/revenue'],
    createdAt: '2024-03-13T14:20:00Z',
    processingTime: 15,
    prompt: MOCK_PROMPT.replace('Dashboard', 'Analytics Chart'),
    frames: makeFrames(6),
  },
  {
    id: 'sess_05QR3D',
    title: 'Dark mode toggle flash',
    status: 'error',
    duration: 15,
    frameCount: 3,
    urls: ['/settings/appearance'],
    createdAt: '2024-03-12T11:00:00Z',
    processingTime: 8,
    prompt: '',
    frames: makeFrames(3),
  },
];

export const getMockSession = (id: string): Session | undefined =>
  MOCK_SESSIONS.find((s) => s.id === id);

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
