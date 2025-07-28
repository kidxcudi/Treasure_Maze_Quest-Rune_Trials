// src/core/Game.js
import * as THREE from 'three';
import { PlayerController } from '../entities/player/PlayerController.js';
import { initScene } from '../rendering/initScene.js';
import { MazeBuilder } from '../entities/environment/maze/MazeBuilder.js';
import { CollisionSystem } from '../core/physics/Collision.js';
import { RuneManager } from '../entities/runes/RuneManager.js';
import { InteractionManager } from '../core/interactions.js';
import { gameState } from './gameState';
import { uiManager } from '../ui/UIManager.js';
import { GameManager } from './GameManager.js';
import { spawnExitMechanism } from '../entities/interactables/mechanisms/ExitMechanism.js';
import { spawnExitDoor } from '../entities/interactables/doors/ExitDoor.js';
import { DoorManager } from '../entities/interactables/doors/DoorManager.js';
import { InputHandler } from './InputHandler.js';
import { TreasureManager } from '../entities/interactables/TreasureManager.js';
import { maze1 } from '../entities/environment/maze/MazeLayout.js';
import { SecretWallSystem } from '../entities/environment/secrets/SecretWalls.js';
import { GameRaycaster } from '../core/physics/Raycaster.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.components = {};
    this.systems = {};
    this._bindMethods();
  }

  async start() {
    try {
      this._setupScene();
      await this._setupGameWorld(); // start screen included here
      this._setupEventListeners();
      this._startGameLoop();
    } catch (error) {
      console.error('Game startup failed:', error);
      this._handleCriticalError();
    }
  }

  _setupScene() {
    const { scene, camera, renderer } = initScene(this.container);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
  }

  async _setupGameWorld() {
    return new Promise((resolve) => {
      uiManager.showStart(async () => {
        document.body.requestPointerLock?.();

        this._initializeGameComponents();
        this._initializeGameSystems();

        // Show HUD after start screen
        uiManager.startGame();
        resolve();
      });
    });
  }

  _initializeGameComponents() {
    // Maze and Environment
    const maze = new MazeBuilder(this.scene);
    const built = maze.build();
    this.components.maze = maze;
    this.components.walls = maze.walls;
    this.components.secretObjects = maze.secretObjects;

    // Player
    const startPos = maze1.objects.playerStart;
    this.components.player = new PlayerController(this.camera, this.scene);
    this.components.player.controls.object.position.set(
      startPos.x * maze1.tileSize,
      1,
      startPos.z * maze1.tileSize
    );

    this.raycaster = new GameRaycaster(this.camera, { range: 3, debug: false });

    // Managers
    this.components.runeManager = new RuneManager(this.scene);
    this.components.treasureManager = new TreasureManager(this.scene, uiManager);

    const exitMechanism = spawnExitMechanism(
      this.scene,
      this.components.gameManager,
      maze1
    );
    this.components.exitMechanism = exitMechanism;

    const exitDoor = spawnExitDoor(this.scene, maze1);
    this.components.exitDoor = exitDoor;

    this.components.gameManager = new GameManager(
      uiManager,
      this.scene,
      this.components.player,
      this.components.exitDoor,
      this.components.exitMechanism
    );

    this.components.doorManager = new DoorManager(
      exitDoor,
      this.components.gameManager
    );

    this.components.runeManager.spawnFromMap(maze1);
    this.components.treasureManager.spawnFromMap(maze1);
    gameState.totalTreasures = this.components.treasureManager.getTreasures().length;
  }

  _initializeGameSystems() {
    this.systems.collision = new CollisionSystem(this.scene, { debug: false });
    const collidableWalls = this.components.walls.filter(w => w.userData.isObstacle !== false);
    this.systems.collision.init(collidableWalls);


    this.systems.interaction = new InteractionManager({
      camera: this.camera,
      scene: this.scene,
      runeManager: this.components.runeManager,
      doorManager: this.components.doorManager,
      uiManager: uiManager,
      player: this.components.player,
      gameManager: this.components.gameManager,
      maze: this.components.maze,
      treasureManager: this.components.treasureManager
    });

    this.systems.input = new InputHandler(
      this.systems.interaction,
      this.components.player
    );

    this.systems.secrets = new SecretWallSystem(
      this.scene,
      this.systems.interaction,
      uiManager
    );


    this.systems.secrets.spawnEasterEgg(maze1);

    this.systems.gameState = new GameManager(
      uiManager,
      this.scene,
      this.components.player,
      this.components.exitDoor,
      this.components.exitMechanism
    );
  }

  _setupEventListeners() {
    window.addEventListener('resize', this.handleResize);
  }

  _startGameLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = this.clock.getDelta();

      try {
        this._updateGame(delta);
        this.renderer.render(this.scene, this.camera);
      } catch (error) {
        console.error('Game loop error:', error);
      }
    };

    animate();
  
  }

  updateTooltip() {
    const runeManager = this.components.runeManager;
    if (!runeManager || runeManager.getRunes().length === 0) {
      uiManager.hideTooltip?.();
      return;
    }

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const intersects = this.raycaster.intersectObjects(runeManager.getRunes(), true);

    if (intersects.length > 0) {
      let rune = intersects[0].object;

      // Climb up to the main rune object
      while (rune && !rune.userData?.isRune && rune.parent) {
        rune = rune.parent;
      }

      const pos = new THREE.Vector3();
      rune.getWorldPosition(pos);

      // Optional: dynamic Y offset based on distance to player
      const playerPos = this.components?.player?.position ?? new THREE.Vector3();
      const distance = rune.position.distanceTo(playerPos);
      const clampedDist = Math.min(distance, 9);
      pos.y += 0.5 - ((clampedDist / 9) * (0.5 - 0.35));

      pos.project(this.camera);

      const screenPos = {
        x: (pos.x + 1) / 2 * window.innerWidth,
        y: (-pos.y + 1) / 2 * window.innerHeight,
      };

      const displayName = rune.userData?.label || rune.userData?.runeType || 'Rune';

      uiManager.showTooltip?.(displayName, {
        worldPosition: screenPos,
        duration: 1000,
      });
    } else {
      uiManager.hideTooltip?.();
    }
  }



  _updateGame(delta) {
    const prevPos = this.components.player.controls.object.position.clone();
    this.components.player.update(delta);

    if (this.systems.collision.checkCollision(this.components.player.controls.object.position)) {
      this.components.player.controls.object.position.copy(prevPos);
    }

    this.components.runeManager.update(performance.now());
    this.systems.secrets.update(this.components.player);
    this.systems.interaction.update(delta);

    uiManager.updateHUD({
      rune: gameState.equippedRune,
      treasuresCollected: gameState.treasuresCollected
    });


    this.updateTooltip();
  }

  _bindMethods() {
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _handleCriticalError() {
    alert('A critical error occurred. The game will reload.');
    window.location.reload();
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);

    Object.values(this.components).forEach(component => {
      if (component.dispose) component.dispose();
    });

    Object.values(this.systems).forEach(system => {
      if (system.dispose) system.dispose();
    });

    while (this.scene.children.length > 0) {
      const child = this.scene.children[0];
      if (child.dispose) child.dispose();
      this.scene.remove(child);
    }

    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }

    uiManager.dispose();
  }
}
