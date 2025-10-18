import { useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import SoundwaveVisualizer from '../components/SoundwaveVisualizer';
import FileUploader from '../components/FileUploader';
import { createRoom } from '../services/roomService';
import { uploadFile } from '../services/storageService';
import { Room, UploadProgress } from '../types';
import { getTimeRemaining } from '../utils/roomCode';

interface CreateRoomProps {
  onRoomCreated: (room: Room) => void;
}

export default function CreateRoom({ onRoomCreated }: CreateRoomProps) {
  const [senderName, setSenderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (!senderName.trim() || selectedFiles.length === 0) {
      alert('Please enter your name and select at least one file');
      return;
    }

    setIsCreating(true);
    setUploadError(null);

    const newRoom = await createRoom(senderName);
    if (!newRoom) {
      alert('Failed to create room');
      setIsCreating(false);
      return;
    }

    setRoom(newRoom);

    const progressMap: { [key: string]: UploadProgress } = {};
    selectedFiles.forEach((file) => {
      progressMap[file.name] = {
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      };
    });
    setUploadProgress(Object.values(progressMap));

    let hasErrors = false;
    for (const file of selectedFiles) {
      try {
        const result = await uploadFile(file, newRoom.id, (progress) => {
          progressMap[file.name].progress = progress;
          setUploadProgress([...Object.values(progressMap)]);
        });

        if (result) {
          progressMap[file.name].status = 'completed';
        } else {
          progressMap[file.name].status = 'error';
          hasErrors = true;
        }
      } catch (error) {
        console.error('File upload failed:', error);
        progressMap[file.name].status = 'error';
        hasErrors = true;
        
        // Set error message for user
        if (error instanceof Error) {
          if (error.message.includes('Bucket not found')) {
            setUploadError('Storage bucket not configured. Please check setup-storage.md for instructions.');
          } else {
            setUploadError(`Upload failed: ${error.message}`);
          }
        }
      }
      setUploadProgress([...Object.values(progressMap)]);
    }

    setIsCreating(false);
    
    if (!hasErrors) {
      onRoomCreated(newRoom);
    }
  };

  const copyLink = () => {
    if (room) {
      const link = `${window.location.origin}/room/${room.room_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const allUploadsComplete = uploadProgress.length > 0 &&
    uploadProgress.every((p) => p.status === 'completed');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            SHIFT
          </h1>
          <p className="text-slate-400 text-lg">Transfer Beyond Touch — Powered by Sound & Speed</p>
        </div>

        <div className="flex justify-center">
          <SoundwaveVisualizer isActive={isCreating || !!room} size="medium" showFrequency />
        </div>

        {!room ? (
          <div className="space-y-6 bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-cyan-700/30">
            {uploadError && (
              <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm font-semibold mb-2">⚠️ Upload Error</p>
                <p className="text-red-300 text-sm">{uploadError}</p>
                <p className="text-red-300/70 text-xs mt-2">
                  Check the setup-storage.md file in the project root for setup instructions.
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-cyan-300 mb-2 uppercase tracking-wider">
                Your Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-slate-800/70 border border-cyan-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                disabled={isCreating}
              />
            </div>

            <FileUploader
              onFilesSelected={setSelectedFiles}
              uploadProgress={uploadProgress}
              disabled={isCreating}
            />

            <button
              onClick={handleCreateRoom}
              disabled={isCreating || !senderName.trim() || selectedFiles.length === 0}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
              <span>{isCreating ? 'Creating Room...' : 'Generate Soundwave Link'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6 bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-cyan-700/30">
            {uploadError && (
              <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm font-semibold mb-2">⚠️ Upload Error</p>
                <p className="text-red-300 text-sm">{uploadError}</p>
                <p className="text-red-300/70 text-xs mt-2">
                  Check SHIFT-FIX-GUIDE.md or setup-storage.md in the project root for setup instructions.
                </p>
              </div>
            )}
            
            <div className="text-center space-y-2">
              <div className={`inline-block px-4 py-2 border rounded-xl ${
                uploadError 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <p className={`font-semibold ${uploadError ? 'text-red-400' : 'text-green-400'}`}>
                  {uploadError ? 'Upload Failed' : (allUploadsComplete ? 'Room Active' : 'Uploading Files...')}
                </p>
              </div>
              <p className="text-slate-400">
                Expires in {getTimeRemaining(room.expires_at)}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-cyan-300 uppercase tracking-wider">
                Room Code
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 px-4 py-3 bg-slate-800/70 border border-cyan-700/50 rounded-xl text-cyan-400 font-mono text-lg text-center">
                  {room.room_code}
                </div>
                <button
                  onClick={copyLink}
                  className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 bg-cyan-950/30 border border-cyan-700/30 rounded-xl">
              <p className="text-sm text-cyan-300 text-center">
                Share this code or link with the receiver
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
