import * as THREE from 'three';

export function setupLighting(scene) {
  // 1. Ambient Light - Reduced intensity for better contrast
  const ambientLight = new THREE.AmbientLight(0x404040, 0.2); // Darker ambient for moody atmosphere
  scene.add(ambientLight);

  // 2. Hemisphere Light - More natural color balance
  const hemiLight = new THREE.HemisphereLight(
    0x5577aa, // Cooler sky color
    0x886622,  // Warmer ground color
    0.5        // Slightly reduced intensity
  );
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // 3. Directional Light - Optimized for maze shadows
  const dirLight = new THREE.DirectionalLight(0xfff4e6, 0.7); // Warm white light
  dirLight.position.set(7, 20, 8); // Higher angle for better shadow definition
  dirLight.castShadow = true;
  
  // Optimized shadow settings:
  dirLight.shadow.mapSize.width = 1024; // Better performance
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  dirLight.shadow.radius = 2; // Softer shadow edges
  scene.add(dirLight);

  // 4. Fill Light - Cooler color for contrast
  const fillLight = new THREE.PointLight(0x4466ff, 0.2, 25);
  fillLight.position.set(-10, 5, -10);
  fillLight.decay = 2; // More natural falloff
  scene.add(fillLight);

  // 5. Rim Light - Better object definition
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(-5, 10, 10);
  scene.add(rimLight);

  // Optional: Add subtle fog for depth
  scene.fog = new THREE.FogExp2(0x111122, 0.025);
}