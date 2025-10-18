import { supabase, STORAGE_BUCKET } from '../lib/supabase';
import { FileData } from '../types';

export async function uploadFile(
  file: File,
  roomId: string,
  onProgress?: (progress: number) => void
): Promise<FileData | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${roomId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Throw error to propagate it to the caller
      throw new Error(uploadError.message || 'Failed to upload file');
    }

    if (onProgress) onProgress(100);

    const { data: fileData, error: insertError } = await supabase
      .from('files')
      .insert({
        room_id: roomId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: fileName,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error('Database insert error:', insertError);
      await supabase.storage.from(STORAGE_BUCKET).remove([fileName]);
      throw new Error('Failed to save file metadata');
    }

    return fileData;
  } catch (error) {
    console.error('Upload exception:', error);
    // Re-throw the error so it can be handled by the caller
    throw error;
  }
}

export async function getDownloadUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

export async function downloadFile(fileData: FileData): Promise<void> {
  const url = await getDownloadUrl(fileData.storage_path);

  if (!url) {
    console.error('Failed to get download URL');
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = fileData.file_name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  await supabase
    .from('files')
    .update({ download_count: fileData.download_count + 1 })
    .eq('id', fileData.id);
}
