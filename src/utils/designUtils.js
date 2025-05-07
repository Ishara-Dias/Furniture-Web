/**
 * Utility functions for design manipulations
 */

// Design element types
export const designElementTypes = {
    FURNITURE: 'furniture',
    WALL: 'wall',
    WINDOW: 'window',
    DOOR: 'door',
    DECORATION: 'decoration',
  };
  
  // Common furniture dimensions (in meters)
  export const furnitureDimensions = {
    sofa: { width: 2.0, length: 0.9, height: 0.8 },
    chair: { width: 0.7, length: 0.7, height: 0.9 },
    table: { width: 1.2, length: 0.8, height: 0.75 },
    bed: { width: 1.5, length: 2.0, height: 0.5 },
    desk: { width: 1.2, length: 0.6, height: 0.75 },
    bookshelf: { width: 0.8, length: 0.3, height: 1.8 },
    dresser: { width: 1.0, length: 0.5, height: 0.8 },
    nightstand: { width: 0.4, length: 0.4, height: 0.6 },
    rug: { width: 2.0, length: 3.0, height: 0.01 },
  };
  
  // Generate a unique ID for design elements
  export const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Create a new design element
export const createDesignElement = (type, x, y, width, length, height, color, rotation = 0, furnitureType = null) => {
  return {
    id: generateUniqueId(),
    type,
    furnitureType, 
    position: { x, y },
    dimensions: { width, length, height },
    color,
    rotation,
    selected: false,
    shaded: false,
  };
};

// Create a furniture element with predefined dimensions
export const createFurnitureElement = (furnitureType, x, y, color, rotation = 0) => {
  const dimensions = furnitureDimensions[furnitureType] || { width: 1, length: 1, height: 0.5 };
  
  return createDesignElement(
    designElementTypes.FURNITURE,
    x,
    y,
    dimensions.width,
    dimensions.length,
    dimensions.height,
    color,
    rotation,
    furnitureType 
  );
};

  // Check if two design elements collide (in 2D)
  export const elementsCollide = (element1, element2) => {
    // Apply rotation to get corners
    const corners1 = getRotatedCorners(element1);
    const corners2 = getRotatedCorners(element2);
    
    // Simplified collision detection using bounding boxes
    // For a more accurate check, you'd need to check for polygon intersection
    const bounds1 = getBoundingBox(corners1);
    const bounds2 = getBoundingBox(corners2);
    
    return (
      bounds1.minX < bounds2.maxX &&
      bounds1.maxX > bounds2.minX &&
      bounds1.minY < bounds2.maxY &&
      bounds1.maxY > bounds2.minY
    );
  };
  
  // Get corners of an element after rotation
  export const getRotatedCorners = (element) => {
    const { x, y } = element.position;
    const { width, length } = element.dimensions;
    const rotation = element.rotation * (Math.PI / 180); // Convert to radians
    
    // Original corners (relative to center)
    const halfWidth = width / 2;
    const halfLength = length / 2;
    
    const corners = [
      { x: -halfWidth, y: -halfLength },
      { x: halfWidth, y: -halfLength },
      { x: halfWidth, y: halfLength },
      { x: -halfWidth, y: halfLength },
    ];
    
    // Rotate corners
    return corners.map((corner) => {
      const rotatedX = corner.x * Math.cos(rotation) - corner.y * Math.sin(rotation);
      const rotatedY = corner.x * Math.sin(rotation) + corner.y * Math.cos(rotation);
      
      return {
        x: rotatedX + x,
        y: rotatedY + y,
      };
    });
  };
  
  // Get bounding box for a set of points
  export const getBoundingBox = (points) => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  };
  
  // Apply shading to a design element
  export const applyShading = (element, intensity = 0.3) => {
    return {
      ...element,
      shaded: true,
      shadingIntensity: intensity,
    };
  };
  
  // Remove shading from a design element
  export const removeShading = (element) => {
    const newElement = { ...element, shaded: false };
    delete newElement.shadingIntensity;
    return newElement;
  };
  
  // Change color of a design element
  export const changeElementColor = (element, newColor) => {
    return {
      ...element,
      color: newColor,
    };
  };
  
  // Scale a design element
  export const scaleElement = (element, scaleFactor) => {
    return {
      ...element,
      dimensions: {
        width: element.dimensions.width * scaleFactor,
        length: element.dimensions.length * scaleFactor,
        height: element.dimensions.height * scaleFactor,
      },
    };
  };