// ── Constants ──
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export function resolveAssetUrl(path: string): string {
  if (path.startsWith('data:')) return path;
  const origin = BASE_URL.replace(/\/api$/, '');
  return `${origin}${path}`;
}

// ── Error class ──
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Token helper ──
// Reads the persisted auth token from Zustand's localStorage.
// The authStore persists under key 'cs-auth' with shape: { state: { accessToken, ... } }
function getToken(): string | null {
  try {
    const raw = localStorage.getItem('cs-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function clearAuthState(): void {
  localStorage.removeItem('cs-auth');
  window.location.href = '/auth';
}

// ── Core fetch wrapper ──
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthState();
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body?.message ?? 'Request failed', body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ── Response types ──
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface SessionSummary {
  id: string;
  userId: string;
  title: string;
  seedUrl?: string | null;
  status: 'processing' | 'complete' | 'error';
  duration: number;
  frameCount: number;
  urlCount: number;
  agentTarget: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';
  processingTime: number;
  promptStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session extends SessionSummary {
  urls: string[];
  prompt: string;
  promptError?: string;
  inspectionJson?: InspectionSummary | null;
  inspectionDurationMs?: number | null;
}

export interface Frame {
  id: string;
  sessionId: string;
  timestamp: number;
  url: string;
  thumbnailUrl: string;
  diffSummary: { added: number; changed: number; removed: number };
  ariaTree: ARIANode[];
  createdAt: string;
}

export interface ARIANode {
  role: string;
  name: string;
  children?: ARIANode[];
  diffStatus?: 'added' | 'changed' | 'removed';
}

// ── Inspection types ──
export interface ElementCounts {
  buttons: number;
  inputs: number;
  links: number;
  headings: number;
  images: number;
  total: number;
}

export interface InspectionSnapshot {
  url: string;
  counts: ElementCounts;
  success: boolean;
  error?: string;
  ariaTree?: string;  // YAML string from Playwright
}

export interface InspectionSummary {
  urlsInspected: string[];
  snapshots: InspectionSnapshot[];
  durationMs: number;
}

// ── Processing status types ──
export interface LaneStatus {
  status: 'pending' | 'running' | 'complete' | 'error';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  detail?: string;
}

export interface ProcessingStatus {
  overallStage: 'uploading' | 'extracting' | 'analyzing' | 'synthesizing' | 'persisting' | 'complete' | 'error';
  visionLane: LaneStatus;
  playwrightLane: LaneStatus;
  frameExtraction: LaneStatus;
  synthesis: LaneStatus;
  lastUpdated: string;
  lastError?: string;
}

export interface SessionStatusResponse {
  sessionId: string;
  sessionStatus: 'processing' | 'complete' | 'error';
  processingStatus: ProcessingStatus | null;
  processingTime: number;
  lastError: string | null;
}

export interface SessionAnalysis {
  id: string;
  sessionId: string;
  timelineJson: unknown | null;
  inspectionJson: InspectionSummary | null;
  visionSuccessCount: number;
  totalFrames: number;
  analysisVersion: number;
  promptStatus: string;
  promptError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithFrames extends Session {
  frames: Frame[];
  analysis?: SessionAnalysis | null;
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  totalDuration: number;
  avgProcessingTime: number;
}

export interface Settings {
  defaultAgent: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';
  includeScreenshots: boolean;
  inlineAriaTree: boolean;
  includeRawDiff: boolean;
  maxRecordingLength: number;
}

// ── Credential types ──
export interface Credential {
  id: string;
  provider: string;
  label: string;
  maskedKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCredentialPayload {
  provider: string;
  label: string;
  apiKey: string;
}

export interface UpdateCredentialPayload {
  label?: string;
  apiKey?: string;
  isActive?: boolean;
}

// ── Request payload types ──
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateSessionPayload {
  title: string;
  prompt?: string;
  agentTarget?: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';
  frameCount?: number;
  urlCount?: number;
}

export interface UpdateSessionPayload {
  title?: string;
  status?: 'processing' | 'complete' | 'error';
  duration?: number;
  urls?: string[];
  processingTime?: number;
  prompt?: string;
  agentTarget?: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';
  frameCount?: number;
  urlCount?: number;
}

export interface UpdateSettingsPayload {
  defaultAgent?: 'CLAUDE_CODE' | 'CODEX' | 'CURSOR' | 'RAW';
  includeScreenshots?: boolean;
  inlineAriaTree?: boolean;
  includeRawDiff?: boolean;
  maxRecordingLength?: number;
}

// ── Processing response from backend ──
export interface ProcessingResponse {
  sessionId: string;
  status: 'complete' | 'error';
  title: string;
  seedUrl: string;
  agentTarget: string;
  fileSize: number;
  mimeType: string;
  promptStatus: 'not_started' | 'generating' | 'complete' | 'error';
  prompt?: string;
  frames: Frame[];
  frameCount: number;
  urlsInspected: string[];
  processingMs: number;
  inspection?: InspectionSummary;
}

export interface GeneratePromptResponse {
  sessionId: string;
  promptStatus: 'generating' | 'complete' | 'error';
  prompt: string | null;
  error?: string;
}

// ── Auth API ──
export const auth = {
  signup: (data: SignupPayload) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginPayload) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<User>('/auth/me'),
};

// ── Sessions API ──
export const sessions = {
  list: (opts?: { limit?: number }) => {
    const qs = opts?.limit != null ? `?limit=${opts.limit}` : '';
    return request<SessionSummary[]>(`/sessions${qs}`);
  },

  get: (id: string) => request<SessionWithFrames>(`/sessions/${id}`),

  create: (data: CreateSessionPayload) =>
    request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSessionPayload) =>
    request<Session>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/sessions/${id}`, {
      method: 'DELETE',
    }),

  stats: () => request<SessionStats>('/sessions/stats'),

  generatePrompt: (id: string) =>
    request<GeneratePromptResponse>(`/sessions/${id}/generate-prompt`, {
      method: 'POST',
    }),

  status: (id: string) => request<SessionStatusResponse>(`/sessions/${id}/status`),
};

// ── Credentials API ──
export const credentials = {
  list: () => request<Credential[]>('/credentials'),
  create: (data: CreateCredentialPayload) =>
    request<Credential>('/credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateCredentialPayload) =>
    request<Credential>(`/credentials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/credentials/${id}`, {
      method: 'DELETE',
    }),
};

// ── Settings API ──
export const settings = {
  get: () => request<Settings>('/settings'),

  update: (data: UpdateSettingsPayload) =>
    request<Settings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Recordings API ──
export const recordings = {
  upload: (file: Blob, meta: { title: string; seedUrl: string; notes?: string; agentTarget?: string; durationMs?: number }) => {
    const formData = new FormData();
    formData.append('file', file, 'recording.webm');
    formData.append('title', meta.title);
    formData.append('seedUrl', meta.seedUrl);
    if (meta.notes) formData.append('notes', meta.notes);
    if (meta.agentTarget) formData.append('agentTarget', meta.agentTarget);
    if (meta.durationMs != null) formData.append('durationMs', String(meta.durationMs));

    return request<ProcessingResponse>('/recordings', {
      method: 'POST',
      body: formData,
    });
  },
};
