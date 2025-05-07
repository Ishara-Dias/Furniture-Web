import React, { useState } from 'react';
import { exportDesignAsJson, saveDesign } from '../utils/storageUtils';

const SaveDesignPanel = ({ roomData, designElements }) => {
  const [designName, setDesignName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [showStatus, setShowStatus] = useState(false);

  const handleSaveDesign = () => {
    if (!designName.trim()) {
      setSaveStatus('Please provide a name for your design');
      setShowStatus(true);
      return;
    }

    if (!roomData) {
      setSaveStatus('No room data available to save');
      setShowStatus(true);
      return;
    }

    // Create a design object with all necessary data
    const design = {
      id: Date.now().toString(),
      name: designName,
      createdAt: new Date().toISOString(),
      roomData,
      designElements: designElements || [],
    };

    // Save to localStorage
    const result = saveDesign(design);

    if (result) {
      setSaveStatus('Design saved successfully!');
      setDesignName('');
    } else {
      setSaveStatus('Failed to save design');
    }
    
    setShowStatus(true);
    
    // Hide status after 3 seconds
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  const handleExportDesign = () => {
    if (!roomData) {
      setSaveStatus('No room data available to export');
      setShowStatus(true);
      return;
    }

    // Create a design object for export
    const design = {
      name: designName || 'Exported Design',
      exportedAt: new Date().toISOString(),
      roomData,
      designElements: designElements || [],
    };

    // Export as JSON file
    const result = exportDesignAsJson(design);

    if (result) {
      setSaveStatus('Design exported successfully!');
    } else {
      setSaveStatus('Failed to export design');
    }
    
    setShowStatus(true);
    
    // Hide status after 3 seconds
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Save Design</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="designName">
          Design Name
        </label>
        <input
          type="text"
          id="designName"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          placeholder="My Room Design"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleSaveDesign}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Save Design
        </button>
        
        <button
          onClick={handleExportDesign}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Export as JSON
        </button>
      </div>
      
      {showStatus && (
        <div className={`mt-4 p-2 text-center rounded ${
          saveStatus.includes('success') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {saveStatus}
        </div>
      )}
    </div>
  );
};

export default SaveDesignPanel;