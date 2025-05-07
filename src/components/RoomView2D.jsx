import React, { useEffect, useRef, useState } from 'react';
import { calculateScalingFactor, generateRoomVertices, isPointInRoom } from '../utils/roomUtils';

const RoomView2D = ({ roomData, designElements, onSelectElement, selectedElementId, onUpdateElement }) => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 500 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  // Calculate scale factor and re-render when room data changes
  useEffect(() => {
    if (!roomData) return;
    
    const newScaleFactor = calculateScalingFactor(
      roomData.dimensions, 
      { width: canvasSize.width, height: canvasSize.height }
    );
    
    setScaleFactor(newScaleFactor);
  }, [roomData, canvasSize]);

  // Update canvas size based on parent div dimensions
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        setCanvasSize({
          width: parent.clientWidth,
          height: parent.clientHeight
        });
        
        // Set canvas dimensions
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Render the room and design elements
// Inside RoomView2D component, modify the useEffect for rendering
useEffect(() => {
  if (!canvasRef.current || !roomData) return;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  // Calculate room vertices
  const roomVertices = generateRoomVertices(roomData.shape, roomData.dimensions);
  
  // Find the bounding box of the room
  const xs = roomVertices.map(v => v.x);
  const ys = roomVertices.map(v => v.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  // Calculate room dimensions from bounding box
  const roomWidth = maxX - minX;
  const roomLength = maxY - minY;
  const roomCenter = {
    x: minX + roomWidth / 2,
    y: minY + roomLength / 2
  };
  
  // Calculate scaling factor to fit room properly
  const viewDimensions = { width: canvas.width - 40, height: canvas.height - 40 };
  const scaleFactor = Math.min(
    viewDimensions.width / roomWidth,
    viewDimensions.height / roomLength
  ) * 0.9; // 90% of max size to leave a margin
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set canvas transform for room drawing
  ctx.save();
  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;
  ctx.translate(canvasCenterX, canvasCenterY);
  
  // Draw room floor
  ctx.beginPath();
  roomVertices.forEach((vertex, index) => {
    const x = (vertex.x - roomCenter.x) * scaleFactor;
    const y = (vertex.y - roomCenter.y) * scaleFactor;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  
  // Fill with floor color
  ctx.fillStyle = roomData.floorColor || '#a97c50';
  ctx.fill();
  
  // Draw room outline
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw grid
  const gridSize = 0.5; // 0.5 meter grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.5;
  
  // Calculate grid bounds
  const gridMinX = Math.floor(minX / gridSize) * gridSize;
  const gridMaxX = Math.ceil(maxX / gridSize) * gridSize;
  const gridMinY = Math.floor(minY / gridSize) * gridSize;
  const gridMaxY = Math.ceil(maxY / gridSize) * gridSize;
  
  // Draw vertical grid lines
  for (let x = gridMinX; x <= gridMaxX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo((x - roomCenter.x) * scaleFactor, (gridMinY - roomCenter.y) * scaleFactor);
    ctx.lineTo((x - roomCenter.x) * scaleFactor, (gridMaxY - roomCenter.y) * scaleFactor);
    ctx.stroke();
  }
  
  // Draw horizontal grid lines
  for (let y = gridMinY; y <= gridMaxY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo((gridMinX - roomCenter.x) * scaleFactor, (y - roomCenter.y) * scaleFactor);
    ctx.lineTo((gridMaxX - roomCenter.x) * scaleFactor, (y - roomCenter.y) * scaleFactor);
    ctx.stroke();
  }
  
  // Draw design elements
  if (designElements && designElements.length > 0) {
    designElements.forEach(element => {
      ctx.save();
      
      // Translate to element position, with adjustment for room center
      const elementX = (element.position.x - roomCenter.x) * scaleFactor;
      const elementY = (element.position.y - roomCenter.y) * scaleFactor;
      ctx.translate(elementX, elementY);
      
      // Apply rotation if specified
      if (element.rotation) {
        ctx.rotate(element.rotation * Math.PI / 180);
      }
      
      // Calculate element dimensions
      const width = element.dimensions.width * scaleFactor;
      const length = element.dimensions.length * scaleFactor;
      
      // Element color with optional shading
      let color = element.color;
      if (element.shaded) {
        ctx.globalAlpha = 0.7;
      }
      ctx.fillStyle = color;
      
      // Draw the element (rectangle)
      ctx.beginPath();
      ctx.rect(-width / 2, -length / 2, width, length);
      ctx.fill();
      
      // Draw selection border if selected
      if (element.id === selectedElementId) {
        ctx.strokeStyle = '#4F46E5'; // Indigo color
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        
        // Draw handles for manipulating
        ctx.fillStyle = '#4F46E5';
        ctx.setLineDash([]);
        
        // Draw corner handles
        const corners = [
          { x: -width / 2, y: -length / 2 },
          { x: width / 2, y: -length / 2 },
          { x: width / 2, y: length / 2 },
          { x: -width / 2, y: length / 2 }
        ];
        
        corners.forEach(corner => {
          ctx.beginPath();
          ctx.arc(corner.x, corner.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Standard border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }
  
  ctx.restore();
  
  // Draw scale indicator at bottom right
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(canvas.width - 100, canvas.height - 30, 90, 20);
  ctx.fillStyle = '#333333';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Scale: 1:${Math.round(1/scaleFactor)}`, canvas.width - 55, canvas.height - 15);
  
}, [roomData, designElements, scaleFactor, selectedElementId, canvasSize]);

  // Convert screen coordinates to room coordinates
// Update the screenToRoomCoords function first
const screenToRoomCoords = (screenX, screenY) => {
  if (!canvasRef.current || !roomData) return { x: 0, y: 0 };
  
  const canvas = canvasRef.current;
  
  // Calculate room vertices and bounds
  const roomVertices = generateRoomVertices(roomData.shape, roomData.dimensions);
  const xs = roomVertices.map(v => v.x);
  const ys = roomVertices.map(v => v.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  // Calculate room center
  const roomWidth = maxX - minX;
  const roomLength = maxY - minY;
  const roomCenter = {
    x: minX + roomWidth / 2,
    y: minY + roomLength / 2
  };
  
  // Canvas center
  const canvasCenterX = canvas.width / 2;
  const canvasCenterY = canvas.height / 2;
  
  // Convert screen coordinates to room coordinates
  return {
    x: roomCenter.x + (screenX - canvasCenterX) / scaleFactor,
    y: roomCenter.y + (screenY - canvasCenterY) / scaleFactor
  };
};

// Then update the handleMouseDown function
const handleMouseDown = (e) => {
  if (!roomData || !designElements) return;
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Convert to room coordinates
  const roomCoords = screenToRoomCoords(mouseX, mouseY);
  
  // Check if clicked on a design element
  for (let i = designElements.length - 1; i >= 0; i--) {
    const element = designElements[i];
    
    // Simple hit test based on bounding box
    const halfWidth = element.dimensions.width / 2;
    const halfLength = element.dimensions.length / 2;
    
    // Transform point to account for element rotation
    const angle = -element.rotation * Math.PI / 180;
    const dx = roomCoords.x - element.position.x;
    const dy = roomCoords.y - element.position.y;
    
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
    
    if (
      rotatedX >= -halfWidth && rotatedX <= halfWidth &&
      rotatedY >= -halfLength && rotatedY <= halfLength
    ) {
      onSelectElement(element.id);
      setIsDragging(true);
      setDraggedElementId(element.id);
      setStartPoint({ x: mouseX, y: mouseY });
      return;
    }
  }
  
  // If no element was clicked, deselect
  onSelectElement(null);
};

// And finally update the handleMouseMove function
const handleMouseMove = (e) => {
  if (!isDragging || !draggedElementId) return;
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Calculate delta in screen coordinates
  const screenDeltaX = mouseX - startPoint.x;
  const screenDeltaY = mouseY - startPoint.y;
  
  // Convert to room coordinate delta
  const roomDeltaX = screenDeltaX / scaleFactor;
  const roomDeltaY = screenDeltaY / scaleFactor;
  
  // Find the element being dragged
  const elementIndex = designElements.findIndex(el => el.id === draggedElementId);
  if (elementIndex === -1) return;
  
  // Create a copy of the element with updated position
  const element = designElements[elementIndex];
  const newPosition = {
    x: element.position.x + roomDeltaX,
    y: element.position.y + roomDeltaY
  };
  
  // Check if the new position is inside the room
  if (isPointInRoom(newPosition, roomData.shape, roomData.dimensions)) {
    // Update the element's position
    const updatedElements = [...designElements];
    updatedElements[elementIndex] = {
      ...element,
      position: newPosition
    };
    
    // Update design elements
    onUpdateElement(updatedElements);
  }
  
  // Update start position for next move
  setStartPoint({ x: mouseX, y: mouseY });
};


  // Handle mouse up event
  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedElementId(null);
  };

  if (!roomData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-500">No room data available. Create a room first.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className="absolute bottom-3 right-3 bg-white bg-opacity-70 rounded-lg px-3 py-2 text-sm text-gray-700">
        Scale: 1:{Math.round(1/scaleFactor)}
      </div>
    </div>
  );
};

export default RoomView2D;