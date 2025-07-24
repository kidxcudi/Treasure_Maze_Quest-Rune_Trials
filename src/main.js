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
import { maze1 } from './maze/MazeLayout.js';
import { handleSecretCollision, checkBreakableWallProximity } from './secrets/SecretWalls.js';
import { StartScreen } from './ui/StartScreen.js';

let scene, camera, renderer, clock;
let player, hud, runeManager, interactionManager;
let walls = [];
let secretObjects = [];
let breakableWalls = [];
let exitTrigger;

function init() {
  const container = document.getElementById('game-container');
  const setup = initScene(container);
  scene = setup.scene;
  camera = setup.camera;
  renderer = setup.renderer;
  clock = new THREE.Clock();

  const startScreen = new StartScreen();
  startScreen.show(() => {
    document.body.requestPointerLock?.();
    startGame(container);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function startGame(container) {
  const maze = buildMaze(scene, secretObjects);
  walls = maze.walls;
  initWallColliders(walls, scene, true);
  breakableWalls = secretObjects.filter(obj => obj.userData.breakable);

  player = new PlayerController(camera, scene);
  const start = maze1.objects.playerStart;
  player.controls.object.position.set(
    start.x * maze1.tileSize,
    1,
    start.z * maze1.tileSize
  );

  hud = new HUD();
  hud.updateRuneDisplay(null);

  runeManager = new RuneManager(scene);
  runeManager.spawnFromMap(maze1);

  const treasureManager = new TreasureManager(scene, hud);
  treasureManager.spawnFromMap(maze1);
  gameState.totalTreasures = treasureManager.getTreasures().length;

  const exitDoor = spawnExitDoor(scene);
  const gameManager = new GameManager(hud, scene, player, exitDoor, null);
  const doorManager = new DoorManager(exitDoor, gameManager);
  gameManager.doorManager = doorManager;

  const exitMechanism = spawnExitMechanism(scene, gameManager);
  exitTrigger = new ExitTriggerZone(player, exitDoor, gameManager);

  const trapManager = null;

  interactionManager = new InteractionManager(
    camera,
    scene,
    runeManager,
    doorManager,
    trapManager,
    [],
    hud,
    player,
    gameManager,
    maze,
    null,
    treasureManager
  );

  const inputHandler = new InputHandler(interactionManager, player);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  const prevPos = player.controls.object.position.clone();
  player.update(delta);

  if (checkCollision(player.controls.object.position)) {
    player.controls.object.position.copy(prevPos);
  }

  runeManager.update(performance.now());

  checkBreakableWallProximity(
    player.controls.object.position,
    player.canBreakWalls,
    breakableWalls,
    scene,
    hud,
    interactionManager
  );

  let insideQuicksand = false;

  for (let obj of secretObjects) {
    const box = new THREE.Box3().setFromObject(obj);
    const playerPos = player.controls.object.position.clone();

    if (box.containsPoint(playerPos)) {
      if (obj.userData.isQuicksand) {
        insideQuicksand = true;
      } else {
        handleSecretCollision(obj, player, scene, hud);
      }
    }
  }

  if (insideQuicksand) {
    player.applyQuicksandEffect();
  } else {
    player.exitQuicksand();
  }

  if (player.isInQuicksand && !player.quicksandStunned) {
    hud.showMessage("⚠ You're stuck in quicksand!");
  } else if (player.quicksandStunned) {
    hud.showMessage("⚠ You're stunned from quicksand!");
  }

  interactionManager?.update(delta);
  exitTrigger?.update();
  renderer.render(scene, camera);
}

window.onload = init;
