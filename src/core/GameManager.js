// src/core/GameManager.js
import { gameState } from './gameState.js';
import { EndScreen } from '../ui/EndScreen.js';

export class GameManager {
  constructor(hud, scene, player, exitDoor, doorManager) {
    this.hud = hud;
    this.scene = scene;
    this.player = player;
    this.exitDoor = exitDoor;
    this.doorManager = doorManager; // ✅ new

    this.exitCountdown = 60;
    this.exitTimer = null;
    this.timerActive = false;
    this.exitActivated = false;

    this.endScreen = new EndScreen();
  }

  startGame() {
    gameState.reset();
    this.hud?.showMessage("Find the treasures and reach the exit...");
    this.hud?.updateRuneDisplay(null);
    this.hud?.updateTimer(0);
    this.timerActive = false;
    this.exitActivated = false;

    if (this.exitTimer) {
      clearInterval(this.exitTimer);
      this.exitTimer = null;
    }

    gameState.timerRunning = false;
    this.exitDoor.locked = true;
    this.exitDoor.doorMesh.material.color.set(0x4444ff);
  }

  triggerExitTimer() {
    if (this.timerActive || this.exitActivated) return;

    console.log("✅ Exit timer triggered");

    this.exitActivated = true;
    this.timerActive = true;

    this.doorManager.unlock(); // ✅ unlock through manager
    this.exitDoor.locked = false; // also update exitDoor itself

    gameState.timerRunning = true;
    this.hud?.startTimer?.(this.exitCountdown);

    let timeLeft = this.exitCountdown;

    this.exitTimer = setInterval(() => {
      console.log("⏱ Timer tick:", timeLeft);
      timeLeft--;
      this.hud?.updateTimer(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(this.exitTimer);
        this.exitTimer = null;
        this.loseGame();
      }
    }, 1000);
  }

  isExitActivated() {
    return this.exitActivated;
  }

  winGame() {
    if (this.exitTimer) {
        clearInterval(this.exitTimer);
        this.exitTimer = null;
    }
    gameState.timerRunning = false;
    gameState.gameOver = true;
    gameState.movementLocked = true; 
    this.hud?.updateTimer(0);

    // NEW: stop player movement and show cursor
    this.player.controls.unlock();               // Disable PointerLock
    document.exitPointerLock?.();                // Fallback
    document.body.style.cursor = 'auto';         // Show cursor

    this.endScreen.showResult("🎉 You Escaped the Maze!");
    }

    loseGame() {
    if (this.exitTimer) {
        clearInterval(this.exitTimer);
        this.exitTimer = null;
    }
    gameState.timerRunning = false;
    gameState.gameOver = true;
    gameState.movementLocked = true; 
    this.hud?.updateTimer(0);

    // NEW: stop player movement and show cursor
    this.player.controls.unlock();               // Disable PointerLock
    document.exitPointerLock?.();
    document.body.style.cursor = 'auto';

    this.endScreen.showResult("💀 Time's up! You are trapped forever.");
    }


  resetGame() {
    this.startGame();
  }
}
