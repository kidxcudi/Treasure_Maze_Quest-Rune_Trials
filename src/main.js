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
import { TreasureManager } from './maze/TreasureManager.js'; // ✅ NEW

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

  // Maze & walls
  const maze = buildMaze(scene);
  walls = maze.walls;

  // Optional: replace with your actual UI manager if used
  const uiManager = null;

  // Player
  player = new PlayerController(camera, scene);
  player.controls.object.position.set(2, 1, 6);

  // HUD
  const hud = new HUD();
  hud.updateRuneDisplay(null);

  // Runes
  runeManager = new RuneManager(scene);

  // Treasures
  const treasureManager = new TreasureManager(scene, hud);
  gameState.totalTreasures = treasureManager.getTreasures().length; // ✅ Track total

  // Exit Door
  const exitDoor = new ExitDoor(scene, new THREE.Vector3(28, 2, 28));

  // Game Manager
  let doorManager;
  const gameManager = new GameManager(hud, scene, player, exitDoor, null);
  doorManager = new DoorManager(exitDoor, gameManager);
  gameManager.doorManager = doorManager;

  const exitMechanism = new ExitMechanism(scene, new THREE.Vector3(20, 0.2, 20), gameManager);
  const exitTrigger = new ExitTriggerZone(player, exitDoor, gameManager);

  // TrapManager placeholder (null unless added later)
  const trapManager = null;

  // Interactions
  interactionManager = new InteractionManager(
    camera,
    scene,
    runeManager,
    doorManager,
    trapManager,
    [],            // interactables
    hud,
    player,
    gameManager,
    maze,
    uiManager,
    treasureManager // ✅ passed in
  );

  const inputHandler = new InputHandler(interactionManager, player);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

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
