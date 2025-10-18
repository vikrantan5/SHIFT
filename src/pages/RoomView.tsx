import { useEffect, useState } from 'react';
import { Download, Clock, User, FileIcon, CheckSquare, Square, PackageCheck } from 'lucide-react';
import SoundwaveVisualizer from '../components/SoundwaveVisualizer';
import { getRoomByCode, getFilesByRoom } from '../services/roomService';
import { downloadFile } from '../services/storageService';
import { Room, FileData } from '../types';
import { formatFileSize, getTimeRemaining } from '../utils/roomCode';

interface RoomViewProps {
  roomCode: string;
}

export default function RoomView({ roomCode }: RoomViewProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [roomCode]);

  const loadRoom = async () => {
    setLoading(true);
    setError(null);

    const roomData = await getRoomByCode(roomCode);

    if (!roomData) {
      setError('Room not found or expired');
      setLoading(false);
      return;
    }

    setRoom(roomData);

    const filesData = await getFilesByRoom(roomData.id);
    setFiles(filesData);
    setLoading(false);
  };

  const handleDownload = async (file: FileData) => {
    setDownloadingIds((prev) => new Set(prev).add(file.id));
    try {
      await downloadFile(file);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, download_count: f.download_count + 1 } : f
        )
      );
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(file.id);
        return next;
      });
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const downloadSelected = async () => {
    if (selectedFiles.size === 0) return;
    
    setIsDownloadingAll(true);
    const filesToDownload = files.filter(f => selectedFiles.has(f.id));
    
    for (const file of filesToDownload) {
      setDownloadingIds((prev) => new Set(prev).add(file.id));
      try {
        await downloadFile(file);
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, download_count: f.download_count + 1 } : f
          )
        );
      } catch (error) {
        console.error(`Failed to download ${file.file_name}:`, error);
      } finally {
        setDownloadingIds((prev) => {
          const next = new Set(prev);
          next.delete(file.id);
          return next;
        });
      }
    }
    
    setIsDownloadingAll(false);
    setSelectedFiles(new Set());
  };

  const downloadAll = async () => {
    setIsDownloadingAll(true);
    
    for (const file of files) {
      setDownloadingIds((prev) => new Set(prev).add(file.id));
      try {
        await downloadFile(file);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, download_count: f.download_count + 1 } : f
          )
        );
      } catch (error) {
        console.error(`Failed to download ${file.file_name}:`, error);
      } finally {
        setDownloadingIds((prev) => {
          const next = new Set(prev);
          next.delete(file.id);
          return next;
        });
      }
    }
    
    setIsDownloadingAll(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <SoundwaveVisualizer isActive size="medium" />
          <p className="text-cyan-400 text-lg">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-red-700/30">
          <div className="text-red-400 text-xl font-semibold">
            {error || 'Room not found'}
          </div>
          <p className="text-slate-400">
            This room may have expired or the code is incorrect
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold text-white transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            SHIFT
          </h1>
          <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 font-semibold">Connection Established</p>
          </div>
        </div>

        <div className="flex justify-center">
          <SoundwaveVisualizer isActive size="medium" />
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-cyan-700/30 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-xl border border-cyan-700/30">
              <User className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">From</p>
                <p className="text-slate-200 font-semibold">{room.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-xl border border-cyan-700/30">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Expires In</p>
                <p className="text-slate-200 font-semibold">{getTimeRemaining(room.expires_at)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-cyan-300">Available Files</h2>
              <span className="text-sm text-slate-400">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            </div>

            {files.length > 1 && (
              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-cyan-700/30">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  data-testid="select-all-files-btn"
                >
                  {selectedFiles.size === files.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
                  </span>
                </button>

                <div className="flex-1" />

                {selectedFiles.size > 0 && (
                  <button
                    onClick={downloadSelected}
                    disabled={isDownloadingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold text-white"
                    data-testid="download-selected-btn"
                  >
                    <Download className={`w-5 h-5 ${isDownloadingAll ? 'animate-bounce' : ''}`} />
                    <span>Download Selected ({selectedFiles.size})</span>
                  </button>
                )}

                {selectedFiles.size === 0 && (
                  <button
                    onClick={downloadAll}
                    disabled={isDownloadingAll}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold text-white"
                    data-testid="download-all-btn"
                  >
                    <PackageCheck className={`w-5 h-5 ${isDownloadingAll ? 'animate-bounce' : ''}`} />
                    <span>{isDownloadingAll ? 'Downloading All...' : 'Download All'}</span>
                  </button>
                )}
              </div>
            )}

            {files.length === 0 ? (
              <div className="text-center py-12">
                <FileIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No files available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {files.map((file) => {
                  const isDownloading = downloadingIds.has(file.id);
                  const isSelected = selectedFiles.has(file.id);
                  return (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                        isSelected
                          ? 'bg-cyan-900/20 border-cyan-600/50'
                          : 'bg-slate-800/50 border-cyan-700/30 hover:border-cyan-600/50'
                      }`}
                    >
                      {files.length > 1 && (
                        <button
                          onClick={() => toggleFileSelection(file.id)}
                          className="mr-3 text-cyan-400 hover:text-cyan-300 transition-colors"
                          data-testid={`select-file-${file.id}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-6 h-6" />
                          ) : (
                            <Square className="w-6 h-6 opacity-50 group-hover:opacity-100" />
                          )}
                        </button>
                      )}
                      
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className={`p-3 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-cyan-500/30' 
                            : 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                        }`}>
                          <FileIcon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 font-medium truncate" data-testid={`file-name-${file.id}`}>
                            {file.file_name}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>{file.download_count} download{file.download_count !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file)}
                        disabled={isDownloading}
                        className="ml-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
                        data-testid={`download-file-${file.id}`}
                      >
                        <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                        <span className="font-semibold">
                          {isDownloading ? 'Downloading...' : 'Download'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
