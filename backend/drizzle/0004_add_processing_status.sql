ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "processing_status" jsonb DEFAULT null;
