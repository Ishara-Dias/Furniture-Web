import React, { useState } from 'react';
import { designElementTypes, furnitureDimensions } from '../utils/designUtils';

const DesignControls = ({ 
  onAddElement, 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement,
  onScaleElement,
  onShadeElement,
  onChangeElementColor
}) => {
  const [furnitureType, setFurnitureType] = useState('sofa');
  const [elementColor, setElementColor] = useState('#8A6642');
  const [scaleValue, setScaleValue] = useState(1);

  const handleAddElement = () => {
    // Get default dimensions based on furniture type
    const dimensions = furnitureDimensions[furnitureType] || { width: 1, length: 1, height: 0.5 };
    
    // Create a new element at the center of the room
    onAddElement({
      type: designElementTypes.FURNITURE,
      furnitureType: furnitureType,
      position: { x: 0, y: 0 },
      dimensions: dimensions,
      color: elementColor,
      rotation: 0,
      shaded: false
    });
  };

  const handleDeleteElement = () => {
    if (selectedElement && onDeleteElement) {
      onDeleteElement(selectedElement.id);
    }
  };

  const handleRotateElement = (direction) => {
    if (!selectedElement || !onUpdateElement) return;
    
    const currentRotation = selectedElement.rotation || 0;
    const rotationAmount = direction === 'left' ? -15 : 15;
    
    onUpdateElement({
      ...selectedElement,
      rotation: currentRotation + rotationAmount
    });
  };

  const handleScaleElement = () => {
    if (!selectedElement || !onScaleElement) return;
    
    onScaleElement(selectedElement.id, scaleValue);
  };

  const handleShadeElement = () => {
    if (!selectedElement || !onShadeElement) return;
    
    onShadeElement(selectedElement.id, !selectedElement.shaded);
  };

  const handleChangeElementColor = () => {
    if (!selectedElement || !onChangeElementColor) return;
    
    onChangeElementColor(selectedElement.id, elementColor);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Design Controls</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Add Furniture</h3>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Furniture Type
          </label>
          <select
            value={furnitureType}
            onChange={(e) => setFurnitureType(e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {Object.keys(furnitureDimensions).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Color
          </label>
          <div className="flex items-center">
            <input
              type="color"
              value={elementColor}
              onChange={(e) => setElementColor(e.target.value)}
              className="h-10 w-10 border-0 rounded p-0 mr-2"
            />
            <span>{elementColor}</span>
          </div>
        </div>
        
        <button
          onClick={handleAddElement}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Furniture
        </button>
      </div>
      
      {selectedElement && (
        <div className="mb-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Edit Selected Element</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rotate
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleRotateElement('left')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                ↺ Rotate Left
              </button>
              <button
                onClick={() => handleRotateElement('right')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                ↻ Rotate Right
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Scale Factor
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scaleValue}
                onChange={(e) => setScaleValue(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold w-10">{scaleValue}x</span>
            </div>
            <button
              onClick={handleScaleElement}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Apply Scale
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Change Color
            </label>
            <div className="flex items-center mb-2">
              <input
                type="color"
                value={elementColor}
                onChange={(e) => setElementColor(e.target.value)}
                className="h-10 w-10 border-0 rounded p-0 mr-2"
              />
              <span>{elementColor}</span>
            </div>
            <button
              onClick={handleChangeElementColor}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Apply Color
            </button>
          </div>
          
          <div className="mb-4">
            <button
              onClick={handleShadeElement}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {selectedElement.shaded ? 'Remove Shade' : 'Apply Shade'}
            </button>
          </div>
          
          <button
            onClick={handleDeleteElement}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Delete Element
          </button>
        </div>
      )}
    </div>
  );
};

export default DesignControls;