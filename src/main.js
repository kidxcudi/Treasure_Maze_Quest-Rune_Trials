import * as THREE from 'three';
import { PlayerController } from './player/PlayerController.js';
import { initScene } from './initScene.js';
import { buildMaze } from './maze/MazeBuilder.js';
import { checkCollision } from './core/Collision.js';
import { RuneManager } from './runes/RuneManager.js';
import { InteractionManager } from './core/interactions.js';
import { gameState } from './core/gameState.js';
import { HUD } from './ui/HUD.js';
import { InputHandler } from './core/InputHandler.js';

let scene, camera, renderer, clock;
let player;
let walls = [];

let runeManager, interactionManager;

function init() {
  const container = document.getElementById('game-container');
  const setup = initScene(container);
  scene = setup.scene;
  camera = setup.camera;
  renderer = setup.renderer;
  clock = new THREE.Clock();

  // Build maze
  const maze = buildMaze(scene);
  walls = maze.walls;

  // Player setup
  player = new PlayerController(camera, scene);
   player.controls.object.position.set(2, 1, 6); // Start position 

  // Runes
  runeManager = new RuneManager(scene);

  const hud = new HUD();
  hud.updateRuneDisplay(null);


  // Interactions
  interactionManager = new InteractionManager(
    camera,
    scene,
    runeManager,
    null,    // doorManager (placeholder for now)
    null,    // trapManager (placeholder for now)
    [],
    hud,
    player      // interactables (e.g., breakable walls)
  );

  const inputHandler = new InputHandler(interactionManager, player);

  // Handle window resizing
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

  const prevPos = player.controls.object.position.clone();
  player.update(delta);

  // Wall collision
  if (checkCollision(player.controls.object.position, walls)) {
    player.controls.object.position.copy(prevPos);
  }

  // Optional: highlight interaction targets (not yet implemented)
  if (interactionManager.update) {
    interactionManager.update(delta);
  }

  renderer.render(scene, camera);
}

window.onload = init;
