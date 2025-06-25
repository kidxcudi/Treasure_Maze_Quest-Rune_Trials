import * as THREE from 'three';
import { PlayerController } from './player/PlayerController.js';
import { initScene } from './initScene.js';
import { buildMaze } from './maze/MazeBuilder.js';
import { checkCollision } from './core/Collision.js';
import { RuneManager } from './runes/RuneManager.js';
import { InteractionManager } from './core/interactions.js';
import { gameState } from './core/gameState.js';
import { HUD } from './ui/HUD.js';
import { GameManager } from './core/GameManager.js';
import { ExitMechanism } from './exit/ExitMechanism.js';
import { ExitDoor } from './exit/ExitDoor.js';
import { ExitTriggerZone } from './exit/ExitTriggerZone.js';
import { DoorManager } from './exit/DoorManager.js';
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

  // Create exit door
  const exitDoor = new ExitDoor(scene, new THREE.Vector3(28, 2, 28));

  // First: temporarily define doorManager as null
  let doorManager;

  // Now create gameManager and pass in doorManager (can be updated later)
  const gameManager = new GameManager(hud, scene, player, exitDoor, null);

  // Now instantiate doorManager (now that gameManager exists)
  doorManager = new DoorManager(exitDoor, gameManager);

  // Finally, set doorManager reference inside gameManager
  gameManager.doorManager = doorManager;


  // Game manager and exit system
  const exitMechanism = new ExitMechanism(scene, new THREE.Vector3(20, 0.2, 20), gameManager);
  const exitTrigger = new ExitTriggerZone(player, exitDoor, gameManager);

  // Interaction manager with real doorManager
  interactionManager = new InteractionManager(
    camera,
    scene,
    runeManager,
    doorManager,
    null,         // trapManager (if any)
    [],
    hud,
    player,
    gameManager
  );

  const inputHandler = new InputHandler(interactionManager, player);

  // Window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Save exit trigger for update in animation loop
  window.exitTrigger = exitTrigger;

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  const prevPos = player.controls.object.position.clone();
  player.update(delta);

  if (checkCollision(player.controls.object.position, walls)) {
    player.controls.object.position.copy(prevPos);
  }

  interactionManager?.update(delta);
  window.exitTrigger?.update();

  renderer.render(scene, camera);
}

window.onload = init;
