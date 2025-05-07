import React from 'react';

const ViewToggle = ({ activeView, onToggleView }) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-md shadow-sm">
        <button
          type="button"
          className={`relative inline-flex items-center px-4 py-2 rounded-l-md ${
            activeView === '2d'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } text-sm font-medium border border-gray-300 focus:z-10 focus:outline-none`}
          onClick={() => onToggleView('2d')}
        >
          <svg 
            className="mr-2 h-4 w-4" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
          2D View
        </button>
        <button
          type="button"
          className={`relative inline-flex items-center px-4 py-2 rounded-r-md ${
            activeView === '3d'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } text-sm font-medium border border-gray-300 focus:z-10 focus:outline-none`}
          onClick={() => onToggleView('3d')}
        >
          <svg 
            className="mr-2 h-4 w-4" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 3L3 8l9 5 9-5-9-5z"></path>
            <path d="M3 8v8l9 5"></path>
            <path d="M21 8v8l-9 5"></path>
          </svg>
          3D View
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;