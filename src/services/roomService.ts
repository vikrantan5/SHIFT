import { supabase } from '../lib/supabase';
import { Room, FileData } from '../types';
import { generateRoomCode, generateSoundSignature } from '../utils/roomCode';

export async function createRoom(senderName: string): Promise<Room | null> {
  const roomCode = generateRoomCode();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const soundSignature = generateSoundSignature();

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      room_code: roomCode,
      name: senderName,
      expires_at: expiresAt,
      sound_signature: soundSignature,
      is_active: true,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating room:', error);
    return null;
  }

  return data;
}

export async function getRoomByCode(roomCode: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching room:', error);
    return null;
  }

  if (data && new Date(data.expires_at) < new Date()) {
    await supabase
      .from('rooms')
      .update({ is_active: false })
      .eq('id', data.id);
    return null;
  }

  return data;
}

export async function getFilesByRoom(roomId: string): Promise<FileData[]> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('room_id', roomId)
    .order('uploaded_at', { ascending: true });

  if (error) {
    console.error('Error fetching files:', error);
    return [];
  }

  return data || [];
}

export async function incrementDownloadCount(fileId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_download_count', { file_id: fileId });

  if (error) {
    console.error('Error incrementing download count:', error);
  }
}
