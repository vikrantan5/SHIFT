-- SHIFT Storage Setup Script
-- Run this in your Supabase SQL Editor to create the storage bucket

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shift-files',
  'shift-files',
  false,  -- Private bucket (use signed URLs for access)
  52428800,  -- 50MB file size limit
  NULL  -- Allow all MIME types
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create storage policies for public access

-- Allow anyone to upload files to the bucket
CREATE POLICY IF NOT EXISTS "Allow public uploads to shift-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shift-files');

-- Allow anyone to read files from the bucket
CREATE POLICY IF NOT EXISTS "Allow public reads from shift-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'shift-files');

-- Allow anyone to update file metadata
CREATE POLICY IF NOT EXISTS "Allow public updates to shift-files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'shift-files');

-- Allow anyone to delete files from the bucket
CREATE POLICY IF NOT EXISTS "Allow public deletes from shift-files"
ON storage.objects FOR DELETE
USING (bucket_id = 'shift-files');

-- Verification query
SELECT 
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE id = 'shift-files';
