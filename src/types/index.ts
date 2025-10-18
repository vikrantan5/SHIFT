export interface Room {
  id: string;
  room_code: string;
  name: string;
  expires_at: string;
  created_at: string;
  is_active: boolean;
  sound_signature: string | null;
}

export interface FileData {
  id: string;
  room_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_at: string;
  download_count: number;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}
