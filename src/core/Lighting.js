import * as THREE from 'three';

export function setupLighting(scene) {
  // Hemisphere light (ambient + sky lighting)
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemiLight);

  // Directional light (for strong shadows, if needed)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);
}
