
import React, { useRef } from 'react';

interface AudioPlayerProps {
  fileName: string | null;
  isPlaying: boolean;
  onFileChange: (file: File | null) => void;
  onPlayPause: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ fileName, isPlaying, onFileChange, onPlayPause }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-coffee-mid/30 rounded-lg">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        accept="audio/*"
      />
      {!fileName ? (
        <button
          onClick={handleButtonClick}
          className="px-6 py-3 bg-amber-500 text-coffee-dark font-bold rounded-lg hover:bg-amber-400 transition-colors duration-200 shadow-md"
        >
          Upload Audio File
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <button
            onClick={onPlayPause}
            className="flex-shrink-0 w-16 h-16 bg-amber-500 text-coffee-dark rounded-full flex items-center justify-center hover:bg-amber-400 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm6 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <div className="text-center sm:text-left overflow-hidden">
            <p className="text-sm text-coffee-light">Now Playing</p>
            <p className="text-md text-coffee-accent font-medium truncate" title={fileName}>
              {fileName}
            </p>
          </div>
            <button
              onClick={handleButtonClick}
              className="ml-auto text-sm text-amber-400 hover:text-amber-500 transition-colors underline"
            >
              Change
            </button>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
