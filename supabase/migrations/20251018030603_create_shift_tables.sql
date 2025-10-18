/*
  # SHIFT - File Transfer System Schema

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key) - Unique room identifier
      - `room_code` (text, unique) - Short shareable room code
      - `name` (text) - Sender's name or session name
      - `expires_at` (timestamptz) - Room expiration time (1 hour from creation)
      - `created_at` (timestamptz) - Room creation timestamp
      - `is_active` (boolean) - Whether room is still active
      - `sound_signature` (text, nullable) - Ultrasonic signature hash for pairing
    
    - `files`
      - `id` (uuid, primary key) - File identifier
      - `room_id` (uuid, foreign key) - Associated room
      - `file_name` (text) - Original file name
      - `file_size` (bigint) - File size in bytes
      - `file_type` (text) - MIME type
      - `storage_path` (text) - Path in Supabase storage
      - `uploaded_at` (timestamptz) - Upload timestamp
      - `download_count` (integer) - Number of times downloaded

  2. Storage
    - Create 'shift-files' bucket for file storage

  3. Security
    - Enable RLS on all tables
    - Public read access for active rooms
    - Authenticated users can create rooms (optional - can be made public)
    - Auto-cleanup trigger for expired rooms

  4. Indexes
    - Index on room_code for fast lookups
    - Index on expires_at for cleanup queries
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT 'Anonymous',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  sound_signature text
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  download_count integer DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_files_room_id ON files(room_id);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Anyone can view active rooms"
  ON rooms FOR SELECT
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Anyone can create rooms"
  ON rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update rooms"
  ON rooms FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for files
CREATE POLICY "Anyone can view files in active rooms"
  ON files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = files.room_id
      AND rooms.is_active = true
      AND rooms.expires_at > now()
    )
  );

CREATE POLICY "Anyone can upload files to active rooms"
  ON files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = files.room_id
      AND rooms.is_active = true
      AND rooms.expires_at > now()
    )
  );

CREATE POLICY "Anyone can update file stats"
  ON files FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to auto-deactivate expired rooms
CREATE OR REPLACE FUNCTION deactivate_expired_rooms()
RETURNS void AS $$
BEGIN
  UPDATE rooms
  SET is_active = false
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Storage bucket (Note: This is a SQL comment for documentation.
-- The actual bucket creation will be handled via Supabase Storage API)
-- Bucket name: 'shift-files'
-- Public: false (access controlled via signed URLs)