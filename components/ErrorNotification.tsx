import React from 'react';
import { ErrorIcon, CloseIcon } from './Icons';

interface ErrorNotificationProps {
  message: string;
  onRetry: () => void;
  onClose: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, onRetry, onClose }) => {
  return (
    <div className="mt-6 w-full bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl relative shadow-lg animate-fade-in" role="alert">
      <div className="flex items-center">
        <ErrorIcon className="w-6 h-6 mr-3"/>
        <div className="flex-1">
          <strong className="font-bold">Đã xảy ra lỗi!</strong>
          <p className="text-sm">{message}</p>
        </div>
        <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-red-500/20 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
      </div>
      <div className="mt-3 text-right">
        <button 
          onClick={onRetry} 
          className="bg-red-500/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
};

// Simple fade-in animation using CSS in style tag (if not using a CSS file)
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`;

// Inject styles into the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
