import * as THREE from 'three';
import { PlayerController } from './player/PlayerController.js';
import { initScene } from './initScene.js';

let scene, camera, renderer, clock;
let player;

function init() {
  const container = document.getElementById('game-container');

  // ✅ Modular scene setup
  const sceneSetup = initScene(container);
  scene = sceneSetup.scene;
  camera = sceneSetup.camera;
  renderer = sceneSetup.renderer;

  clock = new THREE.Clock();

  // Player setup
  player = new PlayerController(camera, scene);
  player.getObject().position.set(0, 1.6, 0);

  // Responsive canvas
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  player.update(delta);
  renderer.render(scene, camera);
}

window.onload = init;
