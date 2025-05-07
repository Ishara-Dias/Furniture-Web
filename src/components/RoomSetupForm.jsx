import React, { useState } from 'react';
import { generateColorScheme, roomColorSchemes } from '../utils/colorUtils';
import { roomShapes } from '../utils/roomUtils';

const RoomSetupForm = ({ onRoomSetup }) => {
  const [roomType, setRoomType] = useState('rectangle');
  const [dimensions, setDimensions] = useState({
    width: 4,
    length: 5,
    size: 4,
    radius: 3,
    cutoutWidth: 2,
    cutoutLength: 2
  });
  const [roomHeight, setRoomHeight] = useState(2.4); // Add room height
  const [colorScheme, setColorScheme] = useState('modern');
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [floorColor, setFloorColor] = useState('#8B4513'); // Brown wood color
  const [wallColor, setWallColor] = useState('#F5F5F5'); // Light gray color
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setDimensions({
      ...dimensions,
      [name]: parseFloat(value)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const roomData = {
      shape: { type: roomType },
      dimensions: getDimensionsForShape(),
      height: roomHeight, // Include room height
      floorColor: floorColor,
      wallColor: wallColor,
      colors: useCustomColor 
        ? generateColorScheme(customColor) 
        : roomColorSchemes[colorScheme]
    };
    
    onRoomSetup(roomData);
  };

  const getDimensionsForShape = () => {
    switch (roomType) {
      case 'rectangle':
        return {
          width: dimensions.width,
          length: dimensions.length
        };
      case 'square':
        return {
          size: dimensions.size
        };
      case 'lShape':
        return {
          width: dimensions.width,
          length: dimensions.length,
          cutoutWidth: dimensions.cutoutWidth,
          cutoutLength: dimensions.cutoutLength
        };
      case 'circle':
        return {
          radius: dimensions.radius
        };
      default:
        return {};
    }
  };

  const renderDimensionInputs = () => {
    switch (roomType) {
      case 'rectangle':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Width (m)
              </label>
              <input
                type="range"
                name="width"
                min={roomShapes.rectangle.minWidth}
                max={roomShapes.rectangle.maxWidth}
                value={dimensions.width}
                onChange={handleDimensionChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center">{dimensions.width}m</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Length (m)
              </label>
              <input
                type="range"
                name="length"
                min={roomShapes.rectangle.minLength}
                max={roomShapes.rectangle.maxLength}
                value={dimensions.length}
                onChange={handleDimensionChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center">{dimensions.length}m</div>
            </div>
          </>
        );
      case 'square':
        return (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Size (m)
            </label>
            <input
              type="range"
              name="size"
              min={roomShapes.square.minSize}
              max={roomShapes.square.maxSize}
              value={dimensions.size}
              onChange={handleDimensionChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center">{dimensions.size}m</div>
          </div>
        );
      case 'lShape':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Width (m)
              </label>
              <input
                type="range"
                name="width"
                min={roomShapes.lShape.minWidth}
                max={roomShapes.lShape.maxWidth}
                value={dimensions.width}
                onChange={handleDimensionChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center">{dimensions.width}m</div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Length (m)
              </label>
              <input
                type="range"
                name="length"
                min={roomShapes.lShape.minLength}
                max={roomShapes.lShape.maxLength}
                value={dimensions.length}
                onChange={handleDimensionChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center">{dimensions.length}m</div>
            </div>
            
            {showAdvanced && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cutout Width (m)
                  </label>
                  <input
                    type="range"
                    name="cutoutWidth"
                    min={1}
                    max={dimensions.width - 1}
                    value={Math.min(dimensions.cutoutWidth, dimensions.width - 1)}
                    onChange={handleDimensionChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center">{dimensions.cutoutWidth}m</div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cutout Length (m)
                  </label>
                  <input
                    type="range"
                    name="cutoutLength"
                    min={1}
                    max={dimensions.length - 1}
                    value={Math.min(dimensions.cutoutLength, dimensions.length - 1)}
                    onChange={handleDimensionChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center">{dimensions.cutoutLength}m</div>
                </div>
              </>
            )}
            
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mb-4 text-indigo-600 hover:text-indigo-900 text-sm"
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
          </>
        );
      case 'circle':
        return (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Radius (m)
            </label>
            <input
              type="range"
              name="radius"
              min={roomShapes.circle.minRadius}
              max={roomShapes.circle.maxRadius}
              value={dimensions.radius}
              onChange={handleDimensionChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center">{dimensions.radius}m</div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderColorSchemePreview = () => {
    const colors = useCustomColor 
      ? generateColorScheme(customColor) 
      : roomColorSchemes[colorScheme];
    
    return (
      <div className="flex justify-center gap-2 my-4">
        {colors.map((color, index) => (
          <div 
            key={index}
            className="w-8 h-8 rounded-full border border-gray-300"
            style={{ backgroundColor: color }}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Room Setup</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Room Shape
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(roomShapes).map((shape) => (
              <div 
                key={shape}
                onClick={() => setRoomType(shape)}
                className={`cursor-pointer p-4 border-2 rounded-lg flex flex-col items-center ${
                  roomType === shape 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  {shape === 'rectangle' && (
                    <div className="w-14 h-10 bg-indigo-500 rounded"></div>
                  )}
                  {shape === 'square' && (
                    <div className="w-12 h-12 bg-indigo-500 rounded"></div>
                  )}
                  {shape === 'lShape' && (
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <path d="M8 8H40V24H24V40H8V8Z" fill="#6366F1" />
                    </svg>
                  )}
                  {shape === 'circle' && (
                    <div className="w-12 h-12 bg-indigo-500 rounded-full"></div>
                  )}
                </div>
                <span className="mt-2 text-sm font-medium">
                  {shape.charAt(0).toUpperCase() + shape.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          {renderDimensionInputs()}
        </div>

        {/* Added Room Height Slider */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Room Height (m)
          </label>
          <input
            type="range"
            min="2"
            max="5"
            step="0.1"
            value={roomHeight}
            onChange={(e) => setRoomHeight(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center">{roomHeight}m</div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Color Scheme
          </label>
          
          <div className="flex mb-4">
            <div className="w-1/2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-indigo-600"
                  checked={!useCustomColor}
                  onChange={() => setUseCustomColor(false)}
                />
                <span className="ml-2">Preset Schemes</span>
              </label>
              
              {!useCustomColor && (
                <div className="mt-3">
                  <select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {Object.keys(roomColorSchemes).map((scheme) => (
                      <option key={scheme} value={scheme}>
                        {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="w-1/2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-indigo-600"
                  checked={useCustomColor}
                  onChange={() => setUseCustomColor(true)}
                />
                <span className="ml-2">Custom Color</span>
              </label>
              
              {useCustomColor && (
                <div className="mt-3 flex items-center">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="h-10 w-10 border-0 rounded p-0"
                  />
                  <span className="ml-2">{customColor}</span>
                </div>
              )}
            </div>
          </div>
          
          {renderColorSchemePreview()}

          <div className="mt-6">
            <h3 className="block text-gray-700 text-sm font-bold mb-2">Room Surface Colors</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Floor Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={floorColor}
                    onChange={(e) => setFloorColor(e.target.value)}
                    className="h-10 w-10 border-0 rounded p-0"
                  />
                  <span className="ml-2">{floorColor}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Wall Color
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={wallColor}
                    onChange={(e) => setWallColor(e.target.value)}
                    className="h-10 w-10 border-0 rounded p-0"
                  />
                  <span className="ml-2">{wallColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105"
          >
            Create Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomSetupForm;