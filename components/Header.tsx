import React from 'react';

// SVG for the upload icon
const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

// SVG for the download icon
const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


// SVG for the refresh icon
const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.695v4.992h-4.992m0 0l-3.181-3.183a8.25 8.25 0 0111.664 0l3.181 3.183" />
    </svg>
);

// SVG for the microphone icon
const MicrophoneIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z" />
        <path d="M17 11a5 5 0 01-5 5 5 5 0 01-5-5H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z" />
    </svg>
);

// SVG for the sparkle icon (Gemini)
const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.5 18l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);


interface HeaderProps {
  onDataUpdate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  onDownloadCsv: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleListening: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDataUpdate, onRefresh, onDownloadCsv, onAnalyze, isLoading, isListening, onToggleListening }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0A2D6E]">
          Воронка продаж
        </h1>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Voice Command Button */}
        <button
            onClick={onToggleListening}
            disabled={isLoading}
            className={`p-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center ${
                isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <MicrophoneIcon className="w-5 h-5" />
        </button>
         
        {/* Analyze with Gemini Button */}
        <button
            onClick={onAnalyze}
            disabled={isLoading}
            className={`px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-sm hover:bg-purple-700 transition-colors flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <SparkleIcon className="w-5 h-5" />
            <span>Анализ с Gemini</span>
        </button>

         {/* File Upload Button */}
        <label htmlFor="data-upload" className={`px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700 transition-colors flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <UploadIcon className="w-5 h-5" />
          <span>XLSX/CSV</span>
          <input
            id="data-upload"
            type="file"
            className="hidden"
            accept=".csv, .xlsx, .xls"
            onChange={onDataUpdate}
            disabled={isLoading}
          />
        </label>
        
        {/* Download CSV Button */}
        <button
            onClick={onDownloadCsv}
            disabled={isLoading}
            className={`px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <DownloadIcon className="w-5 h-5" />
            <span>Скачать CSV</span>
        </button>

        {/* Refresh Button */}
        <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`px-4 py-2 bg-[#1C7AF6] text-white font-semibold rounded-lg shadow-sm hover:bg-[#155cb0] transition-colors flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <RefreshIcon className="w-5 h-5" />
            <span>Обновить данные</span>
        </button>
      </div>
    </header>
  );
};

export default Header;