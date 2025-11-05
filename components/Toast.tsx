import React from 'react';

interface ToastProps {
  message?: string;
  type?: 'success' | 'info' | 'error';
  on_close: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', on_close }) => {
  if (!message) {
    return null;
  }

  const baseClasses = "fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-down";
  const typeClasses = {
    success: "bg-green-100 border border-green-400 text-green-700",
    info: "bg-blue-100 border border-blue-400 text-blue-700",
    error: "bg-red-100 border border-red-400 text-red-700",
  };

  const SuccessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const InfoIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  
  const CloseIcon = () => (
     <svg className="fill-current h-5 w-5" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
  );

  const getIcon = () => {
      switch(type) {
          case 'success': return <SuccessIcon />;
          case 'info': return <InfoIcon />;
          case 'error': return <ErrorIcon />;
          default: return <InfoIcon />;
      }
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
        <div className="flex-shrink-0">{getIcon()}</div>
        <span className="font-semibold flex-grow">{message}</span>
        <button onClick={on_close} className="ml-4 -mr-2 flex-shrink-0">
            <CloseIcon />
        </button>
    </div>
  );
};

export default Toast;