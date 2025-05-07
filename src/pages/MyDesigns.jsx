import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteDesign, loadAllDesigns } from '../utils/storageUtils';

const MyDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Load all saved designs
  useEffect(() => {
    const savedDesigns = loadAllDesigns();
    setDesigns(savedDesigns);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle deleting a design
  const handleDeleteDesign = (designId) => {
    if (window.confirm('Are you sure you want to delete this design?')) {
      const result = deleteDesign(designId);
      
      if (result) {
        // Refresh designs list
        setDesigns(designs.filter(d => d.id !== designId));
        
        // Clear selected design if it was deleted
        if (selectedDesign && selectedDesign.id === designId) {
          setSelectedDesign(null);
        }
      }
    }
  };

  // Render a preview of the room
  const renderRoomPreview = (roomData) => {
    if (!roomData) return null;
    
    const { shape, colors } = roomData;
    
    let preview;
    
    switch (shape.type) {
      case 'rectangle':
        preview = <div className="w-16 h-10 rounded" style={{ backgroundColor: colors[0] }}></div>;
        break;
      case 'square':
        preview = <div className="w-12 h-12 rounded" style={{ backgroundColor: colors[0] }}></div>;
        break;
      case 'lShape':
        preview = (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M8 8H40V24H24V40H8V8Z" fill={colors[0]} />
          </svg>
        );
        break;
      case 'circle':
        preview = <div className="w-12 h-12 rounded-full" style={{ backgroundColor: colors[0] }}></div>;
        break;
      default:
        preview = <div className="w-12 h-12 bg-gray-200 rounded"></div>;
    }
    
    return (
      <div className="flex items-center justify-center p-2 bg-gray-100 rounded">
        {preview}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">My Saved Designs</h1>
      
      {designs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-gray-600 mb-4">You don't have any saved designs yet.</p>
          <Link
            to="/new-design"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition-transform hover:scale-105"
          >
            Create Your First Design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Saved Designs</h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDesign && selectedDesign.id === design.id
                        ? 'bg-indigo-100 border border-indigo-300'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {renderRoomPreview(design.roomData)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {design.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {design.createdAt ? formatDate(design.createdAt) : 'No date'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Link
                  to="/new-design"
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-center"
                >
                  Create New Design
                </Link>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {selectedDesign ? (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedDesign.name}</h2>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit-design/${selectedDesign.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Edit Design
                    </Link>
                    
                    <button
                      onClick={() => handleDeleteDesign(selectedDesign.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600">
                    Created: {selectedDesign.createdAt ? formatDate(selectedDesign.createdAt) : 'Unknown date'}
                  </p>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg" style={{ height: '400px' }}>
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      Preview not available. Click "Edit Design" to view and edit this design.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-bold text-lg mb-2">Design Details:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 font-semibold">Room Shape:</p>
                      <p className="text-gray-800">
                        {selectedDesign.roomData?.shape?.type.charAt(0).toUpperCase() + 
                          selectedDesign.roomData?.shape?.type.slice(1)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 font-semibold">Elements:</p>
                      <p className="text-gray-800">
                        {selectedDesign.designElements?.length || 0} items
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-lg flex items-center justify-center h-full">
                <p className="text-gray-500">Select a design to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDesigns;