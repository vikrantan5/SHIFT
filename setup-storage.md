# SHIFT Storage Setup Instructions

## Issue Found
The storage bucket `shift-files` doesn't exist in your Supabase project, which is preventing file uploads.

## Solution: Create the Storage Bucket

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to https://sfcyyiaixdtlytyzvapy.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `shift-files`
   - **Public bucket**: Toggle **OFF** (we'll use signed URLs for security)
   - **File size limit**: 52428800 (50MB) or your preferred limit
   - **Allowed MIME types**: Leave empty to allow all file types
5. Click **Create bucket**

### Option 2: Via SQL (Advanced)
Run this SQL in your Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('shift-files', 'shift-files', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public uploads and reads
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shift-files');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'shift-files');

CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'shift-files');
```

## After Creating the Bucket
1. Refresh your SHIFT application
2. Try uploading files again
3. Files should now transfer successfully to receivers!

## Verification
After setup, you should see:
- Files upload successfully with a progress bar
- Room shows "Room Active" status
- Receivers can see and download all files
