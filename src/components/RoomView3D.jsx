import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { convert2Dto3D } from '../utils/roomUtils';

const RoomView3D = ({ roomData, designElements }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const wallsRef = useRef([]);
  
  // State for wall visibility toggle
  const [wallsVisible, setWallsVisible] = useState({
    front: true,
    back: true,
    left: true,
    right: true
  });
  
  // Initialize the scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 3;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;
    
    // Add lights
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Directional light to simulate sunlight
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    // Add some fill lights from different angles for more even lighting
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight1.position.set(-10, 10, -10);
    scene.add(fillLight1);
    
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight2.position.set(10, 10, -10);
    scene.add(fillLight2);
    
    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && cameraRef.current && rendererRef.current) {
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of all geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
    };
  }, []);
  
  // Update wall visibility when toggle changes
  useEffect(() => {
    if (!wallsRef.current || wallsRef.current.length === 0) return;
    
    const walls = {
      front: wallsRef.current[0],
      right: wallsRef.current[1],
      back: wallsRef.current[2],
      left: wallsRef.current[3]
    };
    
    // Update each wall's visibility
    for (const [side, isVisible] of Object.entries(wallsVisible)) {
      if (walls[side]) {
        walls[side].visible = isVisible;
      }
    }
  }, [wallsVisible]);
  
  // Update the scene when room data or design elements change
  useEffect(() => {
    if (!sceneRef.current || !roomData) return;
    
    const scene = sceneRef.current;
    
    // Remove all existing objects except lights
    scene.traverse((object) => {
      if (object.isMesh) {
        scene.remove(object);
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
    
    // Reset walls reference
    wallsRef.current = [];
    
    // Create room
    createRoom(scene, roomData);
    
    // Add design elements
    if (designElements && designElements.length > 0) {
      console.log('Adding design elements:', designElements);
      designElements.forEach(element => {
        console.log('Adding element:', element);
        addFurniture(scene, element);
      });
    }
    
    // Adjust camera position based on room dimensions
    updateCameraPosition(roomData);
    
  }, [roomData, designElements]);
  
  // Create the room (floor and walls)
  const createRoom = (scene, roomData) => {
    const roomHeight = roomData.height || 2.4;
    const roomShape = roomData.shape.type;
    const dimensions = roomData.dimensions;
    const floorColor = roomData.floorColor || '#a97c50';
    const wallColor = roomData.wallColor || '#f5f5f5';
    
    // Create floor
    let floorGeometry;
    let floorWidth, floorLength, floorPosition;
    
    if (roomShape === 'rectangle') {
      floorWidth = dimensions.width;
      floorLength = dimensions.length;
      floorGeometry = new THREE.PlaneGeometry(floorWidth, floorLength);
      floorPosition = { x: floorWidth / 2, y: 0, z: floorLength / 2 };
    } else if (roomShape === 'square') {
      floorWidth = dimensions.size;
      floorLength = dimensions.size;
      floorGeometry = new THREE.PlaneGeometry(floorWidth, floorLength);
      floorPosition = { x: floorWidth / 2, y: 0, z: floorLength / 2 };
    } else if (roomShape === 'circle') {
      const radius = dimensions.radius;
      floorGeometry = new THREE.CircleGeometry(radius, 32);
      floorPosition = { x: radius, y: 0, z: radius };
    } else if (roomShape === 'lShape') {
      // Create an L-shaped floor using a shape geometry
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(dimensions.width, 0);
      shape.lineTo(dimensions.width, dimensions.cutoutLength);
      shape.lineTo(dimensions.width - dimensions.cutoutWidth, dimensions.cutoutLength);
      shape.lineTo(dimensions.width - dimensions.cutoutWidth, dimensions.length);
      shape.lineTo(0, dimensions.length);
      shape.lineTo(0, 0);
      
      floorGeometry = new THREE.ShapeGeometry(shape);
      
      // Correct the positioning for L-shape
      // The issue is that the ShapeGeometry doesn't center the shape automatically
      // For L-shape, we need to set the position manually to align with the shape's center
      floorPosition = { 
        x: dimensions.width / 2, 
        y: 0, 
        z: dimensions.length / 2 
      };
    }
    
    // Create floor material with texture
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.8,
      metalness: 0.2
    });
    
    // Add floor texture
    const floorTextureSize = 1; // Size of each tile in meters
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load('/floor-texture.png', (texture) => {
      // This is a fallback in case the texture doesn't load
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      const repeatX = Math.max(floorWidth || dimensions.size || dimensions.radius * 2) / floorTextureSize;
      const repeatY = Math.max(floorLength || dimensions.size || dimensions.radius * 2) / floorTextureSize;
      
      texture.repeat.set(repeatX, repeatY);
      
      floorMaterial.map = texture;
      floorMaterial.needsUpdate = true;
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to horizontal
    floor.position.set(floorPosition.x, floorPosition.y, floorPosition.z);
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Create walls based on room shape
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8 // Slightly transparent walls
    });
    
    if (roomShape === 'rectangle' || roomShape === 'square') {
      // Create four walls for rectangular or square rooms
      const width = roomShape === 'rectangle' ? dimensions.width : dimensions.size;
      const length = roomShape === 'rectangle' ? dimensions.length : dimensions.size;
      
      // Store walls in order: front, right, back, left
      // Wall 1 (front) - Visible by default
      const wall1 = new THREE.Mesh(
        new THREE.BoxGeometry(width, roomHeight, 0.1),
        wallMaterial.clone()
      );
      wall1.position.set(width / 2, roomHeight / 2, length);
      wall1.receiveShadow = true;
      wall1.castShadow = true;
      wall1.userData.wallSide = 'front';
      scene.add(wall1);
      
      // Wall 2 (right) - Visible by default
      const wall2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, roomHeight, length),
        wallMaterial.clone()
      );
      wall2.position.set(width, roomHeight / 2, length / 2);
      wall2.receiveShadow = true;
      wall2.castShadow = true;
      wall2.userData.wallSide = 'right';
      scene.add(wall2);
      
      // Wall 3 (back) - Visible by default
      const wall3 = new THREE.Mesh(
        new THREE.BoxGeometry(width, roomHeight, 0.1),
        wallMaterial.clone()
      );
      wall3.position.set(width / 2, roomHeight / 2, 0);
      wall3.receiveShadow = true;
      wall3.castShadow = true;
      wall3.userData.wallSide = 'back';
      scene.add(wall3);
      
      // Wall 4 (left) - Visible by default
      const wall4 = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, roomHeight, length),
        wallMaterial.clone()
      );
      wall4.position.set(0, roomHeight / 2, length / 2);
      wall4.receiveShadow = true;
      wall4.castShadow = true;
      wall4.userData.wallSide = 'left';
      scene.add(wall4);
      
      // Store references to walls
      wallsRef.current = [wall1, wall2, wall3, wall4];
    }
// For circular rooms
else if (roomShape === 'circle') {
  const radius = dimensions.radius;
  const segments = 32;
  
  // Create floor first (already done in the floor creation part)
  
  // Create the walls - a single cylinder is more reliable than segments
  const wallGeometry = new THREE.CylinderGeometry(
    radius, 
    radius, 
    roomHeight, 
    segments, 
    1, 
    true // Open-ended cylinder
  );
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(radius, roomHeight / 2, radius);
  wall.receiveShadow = true;
  wall.castShadow = true;
  scene.add(wall);
  
  // Create segments for toggling visibility
  // We'll use a different approach by creating wall segments from scratch
  const segmentCount = 4;
  const segmentAngle = Math.PI * 2 / segmentCount;
  
  for (let i = 0; i < segmentCount; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = (i + 1) * segmentAngle;
    
    // Create a shape for each segment
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.absarc(0, 0, radius, startAngle, endAngle, false);
    shape.lineTo(0, 0);
    
    // Extrude the shape to create a segment wall
    const extrudeSettings = {
      steps: 1,
      depth: roomHeight,
      bevelEnabled: false
    };
    
    const segmentGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const segment = new THREE.Mesh(segmentGeometry, wallMaterial.clone());
    
    // Position and rotate properly
    segment.position.set(radius, 0, radius);
    segment.rotation.x = -Math.PI / 2;
    
    // Move to correct height
    segment.position.y = 0;
    
    segment.receiveShadow = true;
    segment.castShadow = true;
    segment.userData.wallSide = ['front', 'right', 'back', 'left'][i];
    
    scene.add(segment);
    wallsRef.current.push(segment);
  }
}
// For L-shaped rooms
// For L-shaped rooms
// For L-shaped rooms - completely rewritten for proper alignment
else if (roomShape === 'lShape') {
  // First, handle the floor correctly
  const handleLShapeFloor = () => {
    // Get the L-shape dimensions
    const { width, length, cutoutWidth, cutoutLength } = roomData.dimensions;
    
    // Create a shape for the L
    const shape = new THREE.Shape();
    
    // Define the L shape points (counter-clockwise for proper facing)
    shape.moveTo(0, 0);                                    // Bottom-left corner
    shape.lineTo(width, 0);                                // Bottom-right corner
    shape.lineTo(width, cutoutLength);                     // Right side, up to cutout
    shape.lineTo(width - cutoutWidth, cutoutLength);       // Left edge of cutout
    shape.lineTo(width - cutoutWidth, length);             // Top of the L (left part)
    shape.lineTo(0, length);                               // Top-left corner
    shape.lineTo(0, 0);                                    // Back to start
    
    // Create geometry from shape
    const geometry = new THREE.ShapeGeometry(shape);
    
    // Create material
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: roomData.floorColor || '#a97c50',
      roughness: 0.8,
      metalness: 0.2
    });
    
    // Create mesh
    const floor = new THREE.Mesh(geometry, floorMaterial);
    
    // Rotate to lie flat on the ground
    floor.rotation.x = -Math.PI / 2;
    
    // Position the floor at y=0
    floor.position.y = 0;
    
    // Enable shadow receiving
    floor.receiveShadow = true;
    
    // Add to scene
    scene.add(floor);
    
    return floor;
  };
  
  // Create the floor
  const lFloor = handleLShapeFloor();
  
  // Now create the walls
  const createLShapeWalls = () => {
    const walls = [];
    const { width, length, cutoutWidth, cutoutLength } = roomData.dimensions;
    
    // Define wall segments manually for precise control
    const wallSegments = [
      // External walls (counter-clockwise)
      { start: [0, 0], end: [width, 0], side: 'back' },                          // Bottom edge
      { start: [width, 0], end: [width, cutoutLength], side: 'right' },           // Right edge, bottom part
      { start: [width, cutoutLength], end: [width - cutoutWidth, cutoutLength], side: 'front' }, // Bottom of cutout
      { start: [width - cutoutWidth, cutoutLength], end: [width - cutoutWidth, length], side: 'right' }, // Right edge, top part
      { start: [width - cutoutWidth, length], end: [0, length], side: 'front' },  // Top edge
      { start: [0, length], end: [0, 0], side: 'left' }                           // Left edge
    ];
    
    // Create each wall segment
    wallSegments.forEach(segment => {
      const [startX, startZ] = segment.start;
      const [endX, endZ] = segment.end;
      
      // Calculate wall dimensions
      const dx = endX - startX;
      const dz = endZ - startZ;
      const wallLength = Math.sqrt(dx * dx + dz * dz);
      
      // Skip if zero length
      if (wallLength === 0) return;
      
      // Create wall geometry
      const wallGeometry = new THREE.BoxGeometry(wallLength, roomHeight, 0.1);
      const wallMat = wallMaterial.clone();
      
      // Make sure material is double-sided
      wallMat.side = THREE.DoubleSide;
      
      const wall = new THREE.Mesh(wallGeometry, wallMat);
      
      // Position at the midpoint of the segment
      const midX = (startX + endX) / 2;
      const midZ = (startZ + endZ) / 2;
      wall.position.set(midX, roomHeight / 2, midZ);
      
      // Rotate to align with the segment
      const angle = Math.atan2(dz, dx);
      wall.rotation.y = angle;
      
      // Set user data for wall toggling
      wall.userData.wallSide = segment.side;
      
      // Set shadows
      wall.receiveShadow = true;
      wall.castShadow = true;
      
      // Add to scene and track
      scene.add(wall);
      walls.push(wall);
    });
    
    return walls;
  };
  
  // Create walls
  wallsRef.current = createLShapeWalls();
  
  // Skip default floor creation by returning
  return;
}
    
    // Add a grid helper for reference
    const gridSize = Math.max(
      dimensions.width || 0,
      dimensions.length || 0,
      dimensions.size || 0,
      (dimensions.radius || 0) * 2,
      20 // Minimum size
    );
    const gridHelper = new THREE.GridHelper(gridSize, gridSize);
    gridHelper.position.y = 0.01; // Slightly above the floor
    scene.add(gridHelper);
  };
  
  // Add furniture to the scene
  const addFurniture = (scene, element) => {
    // Get dimensions and position
    const { width, length, height } = element.dimensions;
    const position = convert2Dto3D(element.position, height / 2);
    const rotation = element.rotation || 0;
    const color = element.color || '#8A6642';
    
    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.2,
      transparent: element.shaded,
      opacity: element.shaded ? 0.7 : 1
    });
    
    let mesh;

    
    // Create different furniture based on type
    switch (element.furnitureType) {
      
      case 'sofa':
        mesh = createSofa(width, length, height, material);
        break;
      case 'chair':
        mesh = createChair(width, length, height, material);
        break;
      case 'table':
        mesh = createTable(width, length, height, material);
        break;
      case 'bed':
        mesh = createBed(width, length, height, material);
        break;
      case 'bookshelf':
        mesh = createBookshelf(width, length, height, material);
        break;
      case 'dresser':
        mesh = createDresser(width, length, height, material);
        break;
      case 'rug':
        mesh = createRug(width, length, height, material);
        break;
      default:
        // Default box
        const geometry = new THREE.BoxGeometry(width, height, length);
        mesh = new THREE.Mesh(geometry, material);
    }
    
    // Position and rotate
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.y = (rotation * Math.PI) / 180;
    
    // Enable shadows
    mesh.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    
    scene.add(mesh);
  };
  
  // Create sofa mesh with more details
  const createSofa = (width, length, height, material) => {
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.BoxGeometry(width, height * 0.4, length);
    const baseMaterial = material.clone();
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -height * 0.3;
    group.add(base);
    
    // Back cushion
    const backGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.5, length * 0.2);
    const backMaterial = material.clone();
    backMaterial.color.set(backMaterial.color).multiplyScalar(0.9); // Slightly darker
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, -height * 0.05, -length * 0.4 + length * 0.1);
    group.add(back);
    
    // Seat cushions
    const seatGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.15, length * 0.7);
    const seatMaterial = material.clone();
    seatMaterial.color.set(seatMaterial.color).multiplyScalar(0.95);
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, -height * 0.225, -length * 0.05);
    
    // Add cushion details - slight indentations
    const cushionDivider = new THREE.BoxGeometry(width * 0.05, height * 0.05, length * 0.7);
    const dividerMaterial = material.clone();
    dividerMaterial.color.set(dividerMaterial.color).multiplyScalar(0.85);
    const divider = new THREE.Mesh(cushionDivider, dividerMaterial);
    divider.position.set(0, -height * 0.2, -length * 0.05);
    
    group.add(seat);
    group.add(divider);
    
    // Arms
    const armGeometry = new THREE.BoxGeometry(width * 0.1, height * 0.4, length * 0.8);
    const armMaterial = material.clone();
    armMaterial.color.set(armMaterial.color).multiplyScalar(0.85); // Darker
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-width * 0.45, -height * 0.2, 0);
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(width * 0.45, -height * 0.2, 0);
    group.add(rightArm);
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(width * 0.02, width * 0.02, height * 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5c3a21, 
      roughness: 0.5, 
      metalness: 0.3 
    });
    
    const legPositions = [
      [-width * 0.4, -height * 0.45, -length * 0.35],
      [width * 0.4, -height * 0.45, -length * 0.35],
      [-width * 0.4, -height * 0.45, length * 0.35],
      [width * 0.4, -height * 0.45, length * 0.35]
    ];
    
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(...pos);
      group.add(leg);
    });
    
    return group;
  };
  
  // Create chair mesh with more details
  const createChair = (width, length, height, material) => {
    const group = new THREE.Group();
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(width, height * 0.1, length);
    const seatMaterial = material.clone();
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = -height * 0.35;
    group.add(seat);
    
    // Back
    const backGeometry = new THREE.BoxGeometry(width, height * 0.55, length * 0.1);
    const backMaterial = material.clone();
    backMaterial.color.set(backMaterial.color).multiplyScalar(0.9);
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, -height * 0.075, -length * 0.45);
    group.add(back);
    
    // Back details - horizontal slats
    const slatsCount = 3;
    const slatHeight = height * 0.4 / slatsCount;
    const slatGap = height * 0.05;
    
    for (let i = 0; i < slatsCount; i++) {
      const slatGeometry = new THREE.BoxGeometry(width * 0.9, slatHeight - slatGap, length * 0.05);
      const slatMaterial = backMaterial.clone();
      slatMaterial.color.set(slatMaterial.color).multiplyScalar(0.95 + i * 0.02);
      
      const slat = new THREE.Mesh(slatGeometry, slatMaterial);
      slat.position.set(
        0,
        -height * 0.25 + i * (slatHeight),
        -length * 0.425
      );
      
      group.add(slat);
    }
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(width * 0.03, width * 0.02, height * 0.4);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const positions = [
      [-width * 0.4, -height * 0.575, -length * 0.4],
      [width * 0.4, -height * 0.575, -length * 0.4],
      [-width * 0.4, -height * 0.575, length * 0.4],
      [width * 0.4, -height * 0.575, length * 0.4]
    ];
    
    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(...pos);
      group.add(leg);
    });
    
    return group;
  };
  
  // Create table mesh with more details
  const createTable = (width, length, height, material) => {
    const group = new THREE.Group();
    
    // Table top
    const topGeometry = new THREE.BoxGeometry(width, height * 0.05, length);
    const topMaterial = material.clone();
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height * 0.025;
    group.add(top);
    
    // Add subtle wood grain to top
    const topDetailGeometry = new THREE.PlaneGeometry(width * 0.98, length * 0.98);
    const topDetailMaterial = material.clone();
    topDetailMaterial.color.set(topDetailMaterial.color).multiplyScalar(1.05);
    
    const topDetail = new THREE.Mesh(topDetailGeometry, topDetailMaterial);
    topDetail.rotation.x = -Math.PI / 2;
    topDetail.position.set(0, height * 0.051, 0);
    group.add(topDetail);
    
    // Table frame under the top
    const frameGeometry = new THREE.BoxGeometry(width * 0.95, height * 0.1, length * 0.95);
    const frameMaterial = material.clone();
    frameMaterial.color.set(frameMaterial.color).multiplyScalar(0.85);
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = -height * 0.05;
    group.add(frame);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(width * 0.05, height * 0.9, length * 0.05);
    const legMaterial = material.clone();
    legMaterial.color.set(legMaterial.color).multiplyScalar(0.8);
    
    const positions = [
      [-width * 0.45, -height * 0.5, -length * 0.45],
      [width * 0.45, -height * 0.5, -length * 0.45],
      [-width * 0.45, -height * 0.5, length * 0.45],
      [width * 0.45, -height * 0.5, length * 0.45]
    ];
    
    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(...pos);
      group.add(leg);
    });
    
    return group;
  };
  
  // Create bed mesh with more details
const createBed = (width, length, height, material) => {
  console.log('Creating bed with dimensions:', width, length, height);
  const group = new THREE.Group();
  
  // Base/frame - slightly darker than the main color
  const baseColor = new THREE.Color(material.color).multiplyScalar(0.85);
  const baseGeometry = new THREE.BoxGeometry(width, height * 0.3, length);
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.7,
    metalness: 0.1
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -height * 0.35;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  
  // Mattress - use original material color
  const mattressGeometry = new THREE.BoxGeometry(width * 0.95, height * 0.2, length * 0.9);
  const mattressMaterial = new THREE.MeshStandardMaterial({
    color: material.color,
    roughness: 0.9,
    metalness: 0.0
  });
  const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
  mattress.position.y = -height * 0.15;
  mattress.castShadow = true;
  mattress.receiveShadow = true;
  group.add(mattress);
  
  // Add pillows (two) at the head of the bed
  const pillowGeometry = new THREE.BoxGeometry(width * 0.35, height * 0.1, length * 0.15);
  const pillowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.0
  });
  
  // Left pillow
  const leftPillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
  leftPillow.position.set(-width * 0.25, -height * 0.1, -length * 0.35);
  leftPillow.castShadow = true;
  leftPillow.receiveShadow = true;
  group.add(leftPillow);
  
  // Right pillow
  const rightPillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
  rightPillow.position.set(width * 0.25, -height * 0.1, -length * 0.35);
  rightPillow.castShadow = true;
  rightPillow.receiveShadow = true;
  group.add(rightPillow);
  
  // Add a blanket/comforter (folded at the end)
  const blanketGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.05, length * 0.4);
  const blanketMaterial = new THREE.MeshStandardMaterial({
    color: 0x4169e1, // Royal blue blanket
    roughness: 0.9,
    metalness: 0.0
  });
  const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
  blanket.position.set(0, -height * 0.075, length * 0.25);
  blanket.castShadow = true;
  blanket.receiveShadow = true;
  group.add(blanket);
  
  // Add headboard
  const headboardGeometry = new THREE.BoxGeometry(width * 1.05, height * 0.5, length * 0.05);
  const headboardMaterial = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.7,
    metalness: 0.2
  });
  const headboard = new THREE.Mesh(headboardGeometry, headboardMaterial);
  headboard.position.set(0, -height * 0.2, -length * 0.47);
  headboard.castShadow = true;
  headboard.receiveShadow = true;
  group.add(headboard);
  
  // Add legs (4 corners)
  const legGeometry = new THREE.CylinderGeometry(width * 0.02, width * 0.02, height * 0.15);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d4037, // Dark brown
    roughness: 0.7,
    metalness: 0.3
  });
  
  const legPositions = [
    [-width * 0.45, -height * 0.5, -length * 0.45],
    [width * 0.45, -height * 0.5, -length * 0.45],
    [-width * 0.45, -height * 0.5, length * 0.45],
    [width * 0.45, -height * 0.5, length * 0.45]
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(...pos);
    leg.castShadow = true;
    leg.receiveShadow = true;
    group.add(leg);
  });
  
  return group;
};

  // Create bookshelf (new furniture type)
  const createBookshelf = (width, length, height, material) => {
    const group = new THREE.Group();
    
    // Main shelf frame
    const frameGeometry = new THREE.BoxGeometry(width, height, length);
    const frameMaterial = material.clone();
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    
    // Create hollow center by subtracting inner geometry
    const innerGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.9, length * 0.8);
    const innerMesh = new THREE.Mesh(innerGeometry);
    innerMesh.position.z = length * 0.1; // Offset inner mesh to create back panel
    
    // Create a hole in the frame using CSG (not available in normal Three.js)
    // We'll fake it by creating individual panels
    
    // Back panel
    const backGeometry = new THREE.BoxGeometry(width, height, length * 0.1);
    const backMesh = new THREE.Mesh(backGeometry, frameMaterial);
    backMesh.position.z = -length * 0.45;
    group.add(backMesh);
    
    // Top panel
    const topGeometry = new THREE.BoxGeometry(width, height * 0.05, length);
    const topMesh = new THREE.Mesh(topGeometry, frameMaterial);
    topMesh.position.y = height * 0.475;
    group.add(topMesh);
    
    // Bottom panel
    const bottomMesh = new THREE.Mesh(topGeometry, frameMaterial);
    bottomMesh.position.y = -height * 0.475;
    group.add(bottomMesh);
    
    // Left panel
    const sideGeometry = new THREE.BoxGeometry(width * 0.05, height, length);
    const leftMesh = new THREE.Mesh(sideGeometry, frameMaterial);
    leftMesh.position.x = -width * 0.475;
    group.add(leftMesh);
    
    // Right panel
    const rightMesh = new THREE.Mesh(sideGeometry, frameMaterial);
    rightMesh.position.x = width * 0.475;
    group.add(rightMesh);
    
    // Shelves - add 3-4 horizontal shelves
    const shelfCount = 4;
    const shelfGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.02, length * 0.9);
    const shelfMaterial = frameMaterial.clone();
    shelfMaterial.color.set(shelfMaterial.color).multiplyScalar(1.1); // Slightly lighter
    
    for (let i = 1; i < shelfCount; i++) {
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelf.position.y = height * 0.4 - i * (height * 0.8 / shelfCount);
      shelf.position.z = 0;
      group.add(shelf);
    }
    
    // Add books on shelves (simplified)
    const bookColors = [0xa52a2a, 0x228b22, 0x4169e1, 0x8b008b, 0x808000, 0x800000];
    
    for (let i = 0; i < shelfCount; i++) {
      // Skip the bottom shelf
      if (i === shelfCount - 1) continue;
      
      const shelfY = height * 0.4 - i * (height * 0.8 / shelfCount);
      const bookCount = 4 + Math.floor(Math.random() * 4); // 4-7 books per shelf
      const bookWidth = (width * 0.8) / bookCount;
      
      for (let j = 0; j < bookCount; j++) {
        const bookHeight = height * 0.15 + Math.random() * height * 0.05;
        const bookDepth = length * 0.7 + Math.random() * length * 0.1;
        
        const bookGeometry = new THREE.BoxGeometry(bookWidth * 0.8, bookHeight, bookDepth);
        const bookMaterial = new THREE.MeshStandardMaterial({
          color: bookColors[Math.floor(Math.random() * bookColors.length)],
          roughness: 0.8,
          metalness: 0.1
        });
        
        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        
        // Position book on shelf
        book.position.x = -width * 0.4 + j * bookWidth + bookWidth * 0.5;
        book.position.y = shelfY + height * 0.02 + bookHeight * 0.5;
        book.position.z = 0;
        
        // Randomly rotate slightly
        book.rotation.y = (Math.random() - 0.5) * 0.2;
        
        group.add(book);
      }
    }
    
    return group;
  };
  
  // Create dresser (new furniture type)
  const createDresser = (width, length, height, material) => {
    const group = new THREE.Group();
    
    // Main dresser body
    const bodyGeometry = new THREE.BoxGeometry(width, height, length);
    const bodyMaterial = material.clone();
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Drawers - create 3 rows of drawers
    const drawerRows = 3;
    const drawerHeight = height * 0.25;
    const drawerMaterial = material.clone();
    drawerMaterial.color.set(drawerMaterial.color).multiplyScalar(1.1); // Slightly lighter
    
    for (let i = 0; i < drawerRows; i++) {
      const drawerGeometry = new THREE.BoxGeometry(width * 0.9, drawerHeight * 0.9, length * 0.05);
      const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
      
      drawer.position.set(0, height * 0.25 - i * drawerHeight, length * 0.45);
      group.add(drawer);
      
      // Drawer handle
      const handleGeometry = new THREE.CylinderGeometry(height * 0.02, height * 0.02, width * 0.3, 8);
      const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.5,
        metalness: 0.7
      });
      
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0, height * 0.25 - i * drawerHeight, length * 0.48);
      group.add(handle);
    }
    
    // Add legs
    const legGeometry = new THREE.CylinderGeometry(width * 0.02, width * 0.01, height * 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const legPositions = [
      [-width * 0.45, -height * 0.55, -length * 0.45],
      [width * 0.45, -height * 0.55, -length * 0.45],
      [-width * 0.45, -height * 0.55, length * 0.45],
      [width * 0.45, -height * 0.55, length * 0.45]
    ];
    
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(...pos);
      group.add(leg);
    });
    
    return group;
  };
  
  // Create rug (new furniture type)
  const createRug = (width, length, height, material) => {
    const group = new THREE.Group();
    
    // Basic rug shape
    const rugGeometry = new THREE.BoxGeometry(width, height, length);
    const rugMaterial = material.clone();
    rugMaterial.side = THREE.DoubleSide;
    
    const rug = new THREE.Mesh(rugGeometry, rugMaterial);
    rug.position.y = height * 0.5;
    group.add(rug);
    
    // Create pattern on rug
    const patternGeometry = new THREE.PlaneGeometry(width * 0.9, length * 0.9);
    const patternMaterial = material.clone();
    patternMaterial.color.set(patternMaterial.color).multiplyScalar(0.85);
    
    const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
    pattern.rotation.x = -Math.PI / 2;
    pattern.position.y = height + 0.001; // Slightly above the rug
    group.add(pattern);
    
    // Add border
    const borderWidth = width * 0.05;
    const borderLength = length - borderWidth * 2;
    
    // Create border edges
    const createBorder = (width, length, x, z) => {
      const borderGeometry = new THREE.PlaneGeometry(width, length);
      const borderMaterial = material.clone();
      borderMaterial.color.set(borderMaterial.color).multiplyScalar(1.1);
      
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      border.rotation.x = -Math.PI / 2;
      border.position.set(x, height + 0.002, z); // Slightly above pattern
      return border;
    };
    
    // Add four borders
    group.add(createBorder(width, borderWidth, 0, -length * 0.5 + borderWidth * 0.5));
    group.add(createBorder(width, borderWidth, 0, length * 0.5 - borderWidth * 0.5));
    group.add(createBorder(borderWidth, borderLength, -width * 0.5 + borderWidth * 0.5, 0));
    group.add(createBorder(borderWidth, borderLength, width * 0.5 - borderWidth * 0.5, 0));
    
    return group;
  };
  
  // Update camera position based on room size
  const updateCameraPosition = (roomData) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const dimensions = roomData.dimensions;
    const shape = roomData.shape.type;
    
    // Calculate room center and size
    let centerX = 0, centerZ = 0, maxDimension = 0;
    
    if (shape === 'rectangle') {
      centerX = dimensions.width / 2;
      centerZ = dimensions.length / 2;
      maxDimension = Math.max(dimensions.width, dimensions.length);
    } 
    else if (shape === 'square') {
      centerX = dimensions.size / 2;
      centerZ = dimensions.size / 2;
      maxDimension = dimensions.size;
    } 
    else if (shape === 'circle') {
      centerX = dimensions.radius;
      centerZ = dimensions.radius;
      maxDimension = dimensions.radius * 2;
    } 
    else if (shape === 'lShape') {
      // For L-shape, use the corner as center
      centerX = dimensions.width / 2;
      centerZ = dimensions.length / 2;
      maxDimension = Math.max(dimensions.width, dimensions.length);
    }
    
    // Calculate camera distance and position
    const distance = maxDimension * 1.5;
    const height = roomData.height * 2 || 4.8;
    
    cameraRef.current.position.set(
      centerX + distance * 0.7,
      height,
      centerZ + distance * 0.7
    );
    
    cameraRef.current.lookAt(centerX, 0, centerZ);
    controlsRef.current.target.set(centerX, 0, centerZ);
    controlsRef.current.update();
  };
  
  // Toggle wall visibility
  const toggleWall = (side) => {
    setWallsVisible(prev => ({
      ...prev,
      [side]: !prev[side]
    }));
  };
  
  // If no room data, show a message
  if (!roomData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-500">No room data available. Create a room first.</p>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      {/* Wall visibility controls */}
      <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 p-2 rounded shadow">
        <div className="text-sm font-medium mb-1">Toggle Walls:</div>
        <div className="grid grid-cols-2 gap-1">
          <button 
            className={`text-xs px-2 py-1 rounded ${wallsVisible.front ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleWall('front')}
          >
            Front
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded ${wallsVisible.back ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleWall('back')}
          >
            Back
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded ${wallsVisible.left ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleWall('left')}
          >
            Left
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded ${wallsVisible.right ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => toggleWall('right')}
          >
            Right
          </button>
        </div>
      </div>
      
      {/* View Angle Presets */}
      <div className="absolute bottom-2 right-2 z-10 bg-white bg-opacity-80 p-2 rounded shadow">
        <div className="text-sm font-medium mb-1">View Angles:</div>
        <div className="grid grid-cols-2 gap-1">
          <button 
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-blue-500 hover:text-white"
            onClick={() => {
              if (cameraRef.current && controlsRef.current && roomData) {
                const center = { 
                  x: roomData.dimensions.width / 2 || roomData.dimensions.size / 2 || roomData.dimensions.radius, 
                  z: roomData.dimensions.length / 2 || roomData.dimensions.size / 2 || roomData.dimensions.radius 
                };
                const dist = Math.max(
                  roomData.dimensions.width || 0,
                  roomData.dimensions.length || 0,
                  roomData.dimensions.size || 0,
                  (roomData.dimensions.radius || 0) * 2
                );
                
                cameraRef.current.position.set(center.x, dist, center.z + dist);
                cameraRef.current.lookAt(center.x, 0, center.z);
                controlsRef.current.target.set(center.x, 0, center.z);
                controlsRef.current.update();
              }
            }}
          >
            Front
          </button>
          <button 
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-blue-500 hover:text-white"
            onClick={() => {
              if (cameraRef.current && controlsRef.current && roomData) {
                const center = { 
                  x: roomData.dimensions.width / 2 || roomData.dimensions.size / 2 || roomData.dimensions.radius, 
                  z: roomData.dimensions.length / 2 || roomData.dimensions.size / 2 || roomData.dimensions.radius 
                };
                const dist = Math.max(
                  roomData.dimensions.width || 0,
                  roomData.dimensions.length || 0,
                  roomData.dimensions.size || 0,
                  (roomData.dimensions.radius || 0) * 2
                );
                
                cameraRef.current.position.set(center.x + dist, dist, center.z);
                cameraRef.current.lookAt(center.x, 0, center.z);
                controlsRef.current.target.set(center.x, 0, center.z);
                controlsRef.current.update();
              }
            }}
          >
            Side
          </button>
          <button 
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-blue-500 hover:text-white"
            onClick={() => {
              if (cameraRef.current && controlsRef.current && roomData) {
                const center = { 
                  x: roomData.dimensions.width / 2 || roomData.dimensions.size / 2 || roomData.dimensions.radius, 
                  z: roomData.dimensions.length / 2 || roomData.dimensions.size / 2 || roomData.dimensions.radius 
                };
                const dist = Math.max(
                  roomData.dimensions.width || 0,
                  roomData.dimensions.length || 0,
                  roomData.dimensions.size || 0,
                  (roomData.dimensions.radius || 0) * 2
                );
                
                cameraRef.current.position.set(center.x, dist * 1.5, center.z);
                cameraRef.current.lookAt(center.x, 0, center.z);
                controlsRef.current.target.set(center.x, 0, center.z);
                controlsRef.current.update();
              }
            }}
          >
            Top
          </button>
          <button 
            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-blue-500 hover:text-white"
            onClick={() => {
              if (cameraRef.current && controlsRef.current && roomData) {
                const center = { 
                  x: roomData.dimensions.width / 2 || roomData.dimensions.size / 2 || roomData.dimensions.radius, 
                  z: roomData.dimensions.length / 2 || roomData.dimensions.size / 2 || roomData.dimensions.radius 
                };
                const dist = Math.max(
                  roomData.dimensions.width || 0,
                  roomData.dimensions.length || 0,
                  roomData.dimensions.size || 0,
                  (roomData.dimensions.radius || 0) * 2
                );
                
                cameraRef.current.position.set(center.x + dist * 0.7, dist * 0.7, center.z + dist * 0.7);
                cameraRef.current.lookAt(center.x, 0, center.z);
                controlsRef.current.target.set(center.x, 0, center.z);
                controlsRef.current.update();
              }
            }}
          >
            Corner
          </button>
        </div>
      </div>
      
      {/* 3D canvas container */}
      <div ref={containerRef} className="w-full h-full bg-gray-100 rounded-lg" style={{ height: '600px' }}>
        {/* 3D canvas will be rendered here */}
      </div>
    </div>
  );
};

export default RoomView3D;