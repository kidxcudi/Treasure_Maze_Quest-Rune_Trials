import * as THREE from 'three';
import { PlayerController } from './player/PlayerController.js';
import { initScene } from './initScene.js';
import { buildMaze } from './maze/MazeBuilder.js';
import { initWallColliders, checkCollision } from './core/Collision.js';
import { RuneManager } from './runes/RuneManager.js';
import { InteractionManager } from './core/interactions.js';
import { gameState } from './core/gameState.js';
import { HUD } from './ui/HUD.js';
import { GameManager } from './core/GameManager.js';
import { spawnExitMechanism } from './exit/ExitMechanism.js';
import { spawnExitDoor } from './exit/ExitDoor.js';
import { ExitTriggerZone } from './exit/ExitTriggerZone.js';
import { DoorManager } from './exit/DoorManager.js';
import { InputHandler } from './core/InputHandler.js';
import { TreasureManager } from './maze/TreasureManager.js';
import { maze1 } from './maze/mazeLayout.js'; // For tileSize and maze data
import { handleSecretCollision, checkBreakableWallProximity} from './secrets/SecretWalls.js';

let scene, camera, renderer, clock;
let player;
let walls = [];
let secretObjects = [];
let breakableWalls = [];
let hud; 
let runeManager, interactionManager;

function init() {
  const container = document.getElementById('game-container');
  const setup = initScene(container);
  scene = setup.scene;
  camera = setup.camera;
  renderer = setup.renderer;
  clock = new THREE.Clock();

  // Maze & walls
  const maze = buildMaze(scene, secretObjects);
  walls = maze.walls;
  initWallColliders(walls, scene, true);
  breakableWalls = secretObjects.filter(obj => obj.userData.breakable);

  // Optional: replace with your actual UI manager if used
  const uiManager = null;

  // Player - positioned at maze start
  player = new PlayerController(camera, scene);
  const start = maze1.objects.playerStart;
  player.controls.object.position.set(
    start.x * maze1.tileSize,
    1,
    start.z * maze1.tileSize
  );

  // HUD
  hud = new HUD();
  hud.updateRuneDisplay(null);

  // Runes
  runeManager = new RuneManager(scene);
  runeManager.spawnFromMap(maze1);

  // Treasures
  const treasureManager = new TreasureManager(scene, hud);
  treasureManager.spawnFromMap(maze1);
  gameState.totalTreasures = treasureManager.getTreasures().length;

  // Exit Door - spawn using helper (returns ExitDoor instance)
  const exitDoor = spawnExitDoor(scene);

  // Game Manager
  const gameManager = new GameManager(hud, scene, player, exitDoor, null);
  const doorManager = new DoorManager(exitDoor, gameManager);
  gameManager.doorManager = doorManager;

  // Exit Mechanism - use helper to spawn correctly
  const exitMechanism = spawnExitMechanism(scene, gameManager);

  // Exit Trigger Zone
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
    treasureManager
  );

  // Input Handler
  const inputHandler = new InputHandler(interactionManager, player);

  // Resize handling
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

  if (checkCollision(player.controls.object.position)) {
    player.controls.object.position.copy(prevPos); // revert if hit
  }

  checkBreakableWallProximity(
    player.controls.object.position,
    player.canBreakWalls,
    breakableWalls,
    scene,
    hud,
    interactionManager  // <-- Pass it here!
  );


  // Track quicksand presence this frame
  let insideQuicksand = false;

  for (let obj of secretObjects) {
    const box = new THREE.Box3().setFromObject(obj);
    const playerPos = player.controls.object.position.clone();

    if (box.containsPoint(playerPos)) {
      if (obj.userData.isQuicksand) {
        insideQuicksand = true;
        hud.showMessage("⚠ You're stuck in quicksand!");
      } else {
        handleSecretCollision(obj, player, scene, hud);
      }
    }
  }


  // Apply or exit quicksand once per frame
  if (insideQuicksand) {
    player.applyQuicksandEffect();
  } else {
    player.exitQuicksand();
  }

  interactionManager?.update(delta);
  window.exitTrigger?.update();

  renderer.render(scene, camera);
}


window.onload = init;
