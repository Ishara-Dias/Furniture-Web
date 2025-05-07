import React from 'react';

const HelpGuide = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">How to Use Room Designer</h1>
        
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Getting Started</h2>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">1. Create a Room</h3>
                <p className="mt-1 text-gray-600">
                  Start by setting up your room's specifications:
                </p>
                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  <li>Choose from rectangle, square, L-shape, or circle room types</li>
                  <li>Set the dimensions (width, length, radius, etc.)</li>
                  <li>Select a color scheme or create your own custom colors</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">2. Add Design Elements</h3>
                <p className="mt-1 text-gray-600">
                  Populate your room with furniture and other elements:
                </p>
                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  <li>Click "Add Element" to add furniture items</li>
                  <li>Choose from various furniture types like sofas, chairs, tables, etc.</li>
                  <li>Select colors for each element</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">3. Customize Your Design</h3>
                <p className="mt-1 text-gray-600">
                  Make adjustments to your design elements:
                </p>
                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  <li>Select elements by clicking on them in the 2D view</li>
                  <li>Rotate elements using the rotate controls</li>
                  <li>Scale elements to resize them</li>
                  <li>Apply shading to create visual depth</li>
                  <li>Change colors to match your desired aesthetic</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">4. Visualize in 2D and 3D</h3>
                <p className="mt-1 text-gray-600">
                  View your design from different perspectives:
                </p>
                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  <li>Toggle between 2D and 3D views</li>
                  <li>In 3D view, click and drag to rotate the camera</li>
                  <li>Use scroll to zoom in and out</li>
                  <li>Right-click and drag to pan the view</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">5. Save Your Design</h3>
                <p className="mt-1 text-gray-600">
                  Preserve your work for later:
                </p>
                <ul className="mt-2 list-disc pl-5 text-gray-600">
                  <li>Enter a name for your design</li>
                  <li>Click "Save Design" to store it in your account</li>
                  <li>Click "Export as JSON" to download a file of your design</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Tips and Tricks</h2>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-900">Efficient Room Design</h3>
                <p className="mt-1 text-gray-600">
                  Start with large furniture pieces first and then add smaller elements. 
                  This helps establish the key focal points of your room.
                </p>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900">Color Coordination</h3>
                <p className="mt-1 text-gray-600">
                  Use complementary colors for a vibrant look or analogous colors for a more 
                  harmonious and subtle design.
                </p>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900">Scale and Proportion</h3>
                <p className="mt-1 text-gray-600">
                  Make sure your furniture is properly scaled to the room size. 
                  Too large or too small furniture can make a room feel awkward.
                </p>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900">Experiment with Layouts</h3>
                <p className="mt-1 text-gray-600">
                  Save multiple versions of your design to compare different layout options 
                  before making final decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Troubleshooting</h2>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-900">Elements Not Appearing</h3>
                <p className="mt-1 text-gray-600">
                  If elements aren't visible, try refreshing the page or checking if they're positioned 
                  outside the room boundaries.
                </p>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900">3D View Not Loading</h3>
                <p className="mt-1 text-gray-600">
                  Make sure your browser supports WebGL. Try using a modern browser like 
                  Chrome, Firefox, or Edge.
                </p>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-900">Designs Not Saving</h3>
                <p className="mt-1 text-gray-600">
                  Make sure you're logged into your account. If issues persist, try using the 
                  "Export as JSON" feature to save your work locally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuide;