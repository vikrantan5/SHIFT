import { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, Loader } from 'lucide-react';
import { formatFileSize } from '../utils/roomCode';
import { UploadProgress } from '../types';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  uploadProgress: UploadProgress[];
  disabled?: boolean;
}

export default function FileUploader({ onFilesSelected, uploadProgress, disabled }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const getFileStatus = (fileName: string) => {
    return uploadProgress.find((p) => p.fileName === fileName);
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive
            ? 'border-cyan-400 bg-cyan-950/30 scale-105'
            : 'border-cyan-700/50 bg-slate-900/50 hover:border-cyan-600/70'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full bg-cyan-500/10 ${dragActive ? 'animate-pulse' : ''}`}>
            <Upload className="w-12 h-12 text-cyan-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-cyan-300">
              {dragActive ? 'Drop files here' : 'Drop files or click to upload'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Support for any file type • Max 500MB per session
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {selectedFiles.map((file, index) => {
              const status = getFileStatus(file.name);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-900/70 rounded-xl border border-cyan-700/30 hover:border-cyan-600/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <File className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                      {status && status.status === 'uploading' && (
                        <div className="mt-1 w-full bg-slate-800 rounded-full h-1.5">
                          <div
                            className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${status.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status?.status === 'uploading' && (
                      <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
                    )}
                    {status?.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {!status && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                        disabled={disabled}
                      >
                        <X className="w-5 h-5 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
