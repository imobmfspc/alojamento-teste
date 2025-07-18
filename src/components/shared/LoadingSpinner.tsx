import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-300"></div>
          <div className="w-12 h-12 rounded-full animate-spin border-4 border-gray-800 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="text-gray-500 text-sm">A carregar...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;