import React, { useEffect, useState } from 'react';
import DesignControls from '../components/DesignControls';
import RoomSetupForm from '../components/RoomSetupForm';
import RoomView2D from '../components/RoomView2D';
import RoomView3D from '../components/RoomView3D';
import SaveDesignPanel from '../components/SaveDesignPanel';
import ViewToggle from '../components/ViewToggle';
import {
  applyShading,
  changeElementColor,
  createFurnitureElement,
  removeShading,
  scaleElement
} from '../utils/designUtils';
import { clearCurrentDesign, loadCurrentDesign, saveCurrentDesign } from '../utils/storageUtils';

const DesignEditor = () => {
  const [roomData, setRoomData] = useState(null);
  const [designElements, setDesignElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeView, setActiveView] = useState('2d');
  const [setupComplete, setSetupComplete] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load saved design on mount
  useEffect(() => {
    const savedDesign = loadCurrentDesign();
    
    if (savedDesign) {
      // Show confirmation modal instead of loading automatically
      setShowConfirmModal(true);
    }
  }, []);
  
  // Handle confirm modal actions
  const handleContinueExisting = () => {
    const savedDesign = loadCurrentDesign();
    setRoomData(savedDesign.roomData);
    setDesignElements(savedDesign.designElements || []);
    setSetupComplete(true);
    setShowConfirmModal(false);
  };
  
  const handleStartNew = () => {
    // Clear current design and show setup form
    clearCurrentDesign();
    setRoomData(null);
    setDesignElements([]);
    setSelectedElementId(null);
    setSetupComplete(false);
    setShowConfirmModal(false);
  };

  // Save current design when it changes
  useEffect(() => {
    if (roomData) {
      saveCurrentDesign({
        roomData,
        designElements,
      });
    }
  }, [roomData, designElements]);

  // Handle room setup
  const handleRoomSetup = (data) => {
    setRoomData(data);
    setSetupComplete(true);
  };

  // Get selected element
  const getSelectedElement = () => {
    if (!selectedElementId) return null;
    return designElements.find(el => el.id === selectedElementId);
  };

  // Handle adding a new element
  const handleAddElement = (elementData) => {
    const { furnitureType, position, color, rotation } = elementData;
    
    // Create new element
    const newElement = createFurnitureElement(
      furnitureType,  // Pass furniture type (chair, sofa, bed, etc.)
      position.x,
      position.y,
      color,
      rotation
    );
    
    // Add to design elements
    setDesignElements(prevElements => [...prevElements, newElement]);
    
    // Select the new element
    setSelectedElementId(newElement.id);
  };

  // Handle updating an element
  const handleUpdateElement = (updatedElement) => {
    setDesignElements(prevElements => 
      prevElements.map(el => 
        el.id === updatedElement.id ? updatedElement : el
      )
    );
  };

  // Handle updating all elements
  const handleUpdateAllElements = (updatedElements) => {
    setDesignElements(updatedElements);
  };

  // Handle deleting an element
  const handleDeleteElement = (elementId) => {
    setDesignElements(prevElements => 
      prevElements.filter(el => el.id !== elementId)
    );
    
    setSelectedElementId(null);
  };

  // Handle scaling an element
  const handleScaleElement = (elementId, scaleFactor) => {
    setDesignElements(prevElements => 
      prevElements.map(el => {
        if (el.id === elementId) {
          return scaleElement(el, scaleFactor);
        }
        return el;
      })
    );
  };

  // Handle shading an element
  const handleShadeElement = (elementId, shouldShade) => {
    setDesignElements(prevElements => 
      prevElements.map(el => {
        if (el.id === elementId) {
          return shouldShade ? applyShading(el) : removeShading(el);
        }
        return el;
      })
    );
  };

  // Handle changing element color
  const handleChangeElementColor = (elementId, newColor) => {
    setDesignElements(prevElements => 
      prevElements.map(el => {
        if (el.id === elementId) {
          return changeElementColor(el, newColor);
        }
        return el;
      })
    );
  };

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!showConfirmModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Unsaved Design Found</h3>
          <p className="mb-6">You have an unsaved design in progress. Would you like to continue working on it or start a new design?</p>
          <div className="flex justify-end space-x-4">
            <button 
              onClick={handleStartNew}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Start New Design
            </button>
            <button 
              onClick={handleContinueExisting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              Continue Existing
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Room Designer</h1>
      
      {/* Confirmation Modal */}
      <ConfirmationModal />
      
      {!setupComplete ? (
        <div className="max-w-2xl mx-auto">
          <RoomSetupForm onRoomSetup={handleRoomSetup} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DesignControls
              onAddElement={handleAddElement}
              selectedElement={getSelectedElement()}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              onScaleElement={handleScaleElement}
              onShadeElement={handleShadeElement}
              onChangeElementColor={handleChangeElementColor}
            />
            
            <div className="mt-6">
              <SaveDesignPanel
                roomData={roomData}
                designElements={designElements}
              />
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <ViewToggle 
              activeView={activeView} 
              onToggleView={setActiveView} 
            />
            
            <div className="bg-white p-4 rounded-lg shadow-lg" style={{ height: '600px' }}>
              {activeView === '2d' ? (
                <RoomView2D
                  roomData={roomData}
                  designElements={designElements}
                  onSelectElement={setSelectedElementId}
                  selectedElementId={selectedElementId}
                  onUpdateElement={handleUpdateAllElements}
                />
              ) : (
                <RoomView3D
                  roomData={roomData}
                  designElements={designElements}
                />
              )}
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">Instructions:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Click "Add Furniture" to add furniture to your room</li>
                <li>Select elements by clicking on them in the 2D view</li>
                <li>Rotate, scale, shade, or change color of selected elements</li>
                <li>Toggle between 2D and 3D views to visualize your design</li>
                <li>Save your design when complete</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignEditor;