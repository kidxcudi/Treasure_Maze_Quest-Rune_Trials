import * as THREE from 'three';
import { setupLighting } from './core/Lighting.js';

export function initScene(container) {
  const scene = new THREE.Scene();

  // Set sky color as background (light blue sky)
  scene.background = new THREE.Color(0x87ceeb);

  // Optional: add subtle fog to enhance depth perception
  scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Enable shadow map for shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.appendChild(renderer.domElement);

  // Setup lighting (which includes shadow-casting directional light)
  setupLighting(scene);

  // Ground plane - sand color, receives shadows
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0xd8cab8 }) // Sand
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  return { scene, camera, renderer };
}
