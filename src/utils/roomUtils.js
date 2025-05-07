/**
 * Utility functions for room calculations and transformations
 */

// Room shape templates
export const roomShapes = {
    rectangle: { type: 'rectangle', minWidth: 2, maxWidth: 20, minLength: 2, maxLength: 30 },
    square: { type: 'square', minSize: 2, maxSize: 20 },
    lShape: { type: 'lShape', minWidth: 3, maxWidth: 20, minLength: 3, maxLength: 20 },
    circle: { type: 'circle', minRadius: 1, maxRadius: 10 },
  };
  
  // Calculate room area
  export const calculateRoomArea = (shape, dimensions) => {
    switch (shape.type) {
      case 'rectangle':
        return dimensions.width * dimensions.length;
      case 'square':
        return dimensions.size * dimensions.size;
      case 'lShape': {
        // L-shape is like a rectangle with a missing corner
        const mainArea = dimensions.width * dimensions.length;
        const cutoutArea = dimensions.cutoutWidth * dimensions.cutoutLength;
        return mainArea - cutoutArea;
      }
      case 'circle':
        return Math.PI * dimensions.radius * dimensions.radius;
      default:
        return 0;
    }
  };
  
  // Generate room vertices for rendering
  export const generateRoomVertices = (shape, dimensions) => {
    switch (shape.type) {
      case 'rectangle':
        return [
          { x: 0, y: 0 },
          { x: dimensions.width, y: 0 },
          { x: dimensions.width, y: dimensions.length },
          { x: 0, y: dimensions.length },
        ];
      case 'square':
        return [
          { x: 0, y: 0 },
          { x: dimensions.size, y: 0 },
          { x: dimensions.size, y: dimensions.size },
          { x: 0, y: dimensions.size },
        ];
      case 'lShape':
        return [
          { x: 0, y: 0 },
          { x: dimensions.width, y: 0 },
          { x: dimensions.width, y: dimensions.cutoutLength },
          { x: dimensions.width - dimensions.cutoutWidth, y: dimensions.cutoutLength },
          { x: dimensions.width - dimensions.cutoutWidth, y: dimensions.length },
          { x: 0, y: dimensions.length },
        ];
      case 'circle':
        // For circle, return points to approximate a circle
        const points = [];
        const segments = 36; // Number of segments to approximate circle
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          points.push({
            x: dimensions.radius * Math.cos(angle) + dimensions.radius,
            y: dimensions.radius * Math.sin(angle) + dimensions.radius,
          });
        }
        return points;
      default:
        return [];
    }
  };
  
  // Check if a point is inside the room
  export const isPointInRoom = (point, shape, dimensions) => {
    const vertices = generateRoomVertices(shape, dimensions);
    
    if (shape.type === 'circle') {
      const center = { x: dimensions.radius, y: dimensions.radius };
      const distance = Math.sqrt(
        Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
      );
      return distance <= dimensions.radius;
    }
    
    // For polygons, use ray casting algorithm
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;
      
      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        
      if (intersect) inside = !inside;
    }
    
    return inside;
  };
  
  // Convert from 2D coordinates to 3D
  export const convert2Dto3D = (point, height = 0) => {
    return {
      x: point.x,
      y: height,
      z: point.y, // y in 2D becomes z in 3D
    };
  };
  
  // Calculate scaling factor to fit room to view
  export const calculateScalingFactor = (roomDimensions, viewDimensions) => {
    let maxRoomDimension = 0;
    
    // Find max dimension of the room
    if (roomDimensions.width) maxRoomDimension = Math.max(maxRoomDimension, roomDimensions.width);
    if (roomDimensions.length) maxRoomDimension = Math.max(maxRoomDimension, roomDimensions.length);
    if (roomDimensions.size) maxRoomDimension = roomDimensions.size;
    if (roomDimensions.radius) maxRoomDimension = roomDimensions.radius * 2;
    
    // Find min dimension of the view
    const minViewDimension = Math.min(viewDimensions.width, viewDimensions.height);
    
    // Add padding
    const padding = 40; // 20px on each side
    
    return (minViewDimension - padding) / maxRoomDimension;
  };