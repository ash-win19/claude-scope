import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const sessionStatusEnum = pgEnum('session_status', [
  'processing',
  'complete',
  'error',
]);

export const agentTypeEnum = pgEnum('agent_type', [
  'CLAUDE_CODE',
  'CODEX',
  'CURSOR',
  'RAW',
]);

export const users = pgTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  status: sessionStatusEnum('status').notNull().default('processing'),
  duration: integer('duration').notNull().default(0),
  frameCount: integer('frame_count').notNull().default(0),
  urls: jsonb('urls').$type<string[]>().notNull().default([]),
  processingTime: integer('processing_time').notNull().default(0),
  prompt: text('prompt').notNull().default(''),
  agentTarget: agentTypeEnum('agent_target').notNull().default('CLAUDE_CODE'),
  urlCount: integer('url_count').notNull().default(0),
  seedUrl: text('seed_url').notNull().default(''),
  notes: text('notes'),
  lastError: text('last_error'),
  inspectionJson: jsonb('inspection_json').$type<InspectionResultJson | null>().default(null),
  inspectionDurationMs: integer('inspection_duration_ms'),
  analysis: jsonb('analysis').$type<AnalysisJson | null>().default(null),
  promptStatus: varchar('prompt_status', { length: 20 }).notNull().default('not_started'),
  promptError: text('prompt_error'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index('sessions_user_created_idx').on(table.userId, table.createdAt.desc()),
]);

export interface ARIANodeJson {
  role: string;
  name: string;
  children?: ARIANodeJson[];
  diffStatus?: 'added' | 'changed' | 'removed';
}

export interface DiffSummaryJson {
  added: number;
  changed: number;
  removed: number;
}

export const frames = pgTable('frames', {
  id: varchar('id', { length: 36 }).primaryKey(),
  sessionId: varchar('session_id', { length: 36 })
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  timestamp: integer('timestamp').notNull().default(0),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  diffSummary: jsonb('diff_summary')
    .$type<DiffSummaryJson>()
    .notNull()
    .default({ added: 0, changed: 0, removed: 0 }),
  ariaTree: jsonb('aria_tree').$type<ARIANodeJson[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index('frames_session_timestamp_idx').on(table.sessionId, table.timestamp.asc()),
]);

export const userSettings = pgTable('user_settings', {
  userId: varchar('user_id', { length: 36 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  defaultAgent: agentTypeEnum('default_agent').notNull().default('CLAUDE_CODE'),
  includeScreenshots: integer('include_screenshots').notNull().default(1),
  inlineAriaTree: integer('inline_aria_tree').notNull().default(1),
  includeRawDiff: integer('include_raw_diff').notNull().default(0),
  maxRecordingLength: integer('max_recording_length').notNull().default(30),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export interface InspectionResultJson {
  urlsInspected: string[];
  snapshots: Array<{
    url: string;
    ariaTree: string;
    counts: { buttons: number; inputs: number; links: number; headings: number; images: number; total: number };
    success: boolean;
    error?: string;
  }>;
  durationMs: number;
}

export interface AnalysisJson {
  timeline: {
    summary: string;
    durationMs: number;
    frameCount: number;
    failedFrames: number;
    events: Array<{
      timestampMs: number;
      frameId: string;
      type: string;
      summary: string;
      elements: Array<{ type: string; label: string; state?: string }>;
    }>;
  };
  inspection: InspectionResultJson;
  visionSuccessCount: number;
  totalFrames: number;
}
