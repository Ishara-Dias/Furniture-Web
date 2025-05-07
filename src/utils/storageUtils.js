/**
 * Utility functions for saving and loading designs
 */

// Storage keys
const STORAGE_KEYS = {
    DESIGNS: 'room_designer_designs',
    CURRENT_DESIGN: 'room_designer_current_design',
  };
  
  // Save a design to localStorage
  export const saveDesign = (design) => {
    try {
      // Get existing designs
      const existingDesignsString = localStorage.getItem(STORAGE_KEYS.DESIGNS);
      let designs = [];
      
      if (existingDesignsString) {
        designs = JSON.parse(existingDesignsString);
      }
      
      // Check if design already exists
      const existingIndex = designs.findIndex(d => d.id === design.id);
      
      if (existingIndex >= 0) {
        // Update existing design
        designs[existingIndex] = design;
      } else {
        // Add new design
        designs.push(design);
      }
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(designs));
      
      return true;
    } catch (error) {
      console.error('Error saving design:', error);
      return false;
    }
  };
  
  // Load all saved designs
  export const loadAllDesigns = () => {
    try {
      const designsString = localStorage.getItem(STORAGE_KEYS.DESIGNS);
      
      if (!designsString) {
        return [];
      }
      
      return JSON.parse(designsString);
    } catch (error) {
      console.error('Error loading designs:', error);
      return [];
    }
  };
  
  // Load a specific design by ID
  export const loadDesignById = (designId) => {
    try {
      const designs = loadAllDesigns();
      return designs.find(d => d.id === designId) || null;
    } catch (error) {
      console.error('Error loading design by ID:', error);
      return null;
    }
  };
  
  // Delete a design
  export const deleteDesign = (designId) => {
    try {
      // Get existing designs
      const designs = loadAllDesigns();
      
      // Filter out the design to delete
      const updatedDesigns = designs.filter(d => d.id !== designId);
      
      // Save updated list
      localStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(updatedDesigns));
      
      return true;
    } catch (error) {
      console.error('Error deleting design:', error);
      return false;
    }
  };
  
  // Save current design (work in progress)
  export const saveCurrentDesign = (design) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DESIGN, JSON.stringify(design));
      return true;
    } catch (error) {
      console.error('Error saving current design:', error);
      return false;
    }
  };
  
  // Load current design (work in progress)
  export const loadCurrentDesign = () => {
    try {
      const currentDesignString = localStorage.getItem(STORAGE_KEYS.CURRENT_DESIGN);
      
      if (!currentDesignString) {
        return null;
      }
      
      return JSON.parse(currentDesignString);
    } catch (error) {
      console.error('Error loading current design:', error);
      return null;
    }
  };
  
  // Export design as JSON
  export const exportDesignAsJson = (design) => {
    try {
      const designJson = JSON.stringify(design, null, 2);
      const blob = new Blob([designJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `room-design-${design.id}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting design:', error);
      return false;
    }
  };
  
  // Import design from JSON file
  export const importDesignFromJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const design = JSON.parse(event.target.result);
          resolve(design);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  };

  // Clear the current design from localStorage
export const clearCurrentDesign = () => {
  try {
    localStorage.removeItem('room_designer_current_design');
    return true;
  } catch (error) {
    console.error('Error clearing current design:', error);
    return false;
  }
};