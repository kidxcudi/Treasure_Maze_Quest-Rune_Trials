// src/core/game/GameManager.js
import { gameState } from './gameState.js';
import { EndScreen } from '../ui/screens/EndScreen.js';
import { EventBus } from './utils/EventBus.js';

export class GameManager {
  constructor({ hud, scene, player, exitDoor, doorManager }) {
    this.dependencies = { hud, scene, player, exitDoor, doorManager };
    this.exitCountdown = 60;
    this.exitTimer = null;
    this.timerActive = false;
    this.exitActivated = false;
    this.endScreen = new EndScreen();

    this.setupEventListeners();
  }

  setupEventListeners() {
    EventBus.on('game:reset', () => this.resetGame());
    EventBus.on('game:win', () => this.winGame());
    EventBus.on('game:lose', () => this.loseGame());
  }

  startGame() {
    this.cleanupTimer();
    gameState.reset();
    
    this.dependencies.hud?.showMessage("Find the treasures and reach the exit...");
    this.dependencies.hud?.updateRuneDisplay(null);
    this.dependencies.hud?.updateTimer(0);
    
    this.timerActive = false;
    this.exitActivated = false;
    this.dependencies.exitDoor.setLocked();
  }

  triggerExitTimer() {
    if (this.timerActive || this.exitActivated) return;

    this.exitActivated = true;
    this.timerActive = true;

    this.dependencies.doorManager.unlock();
    this.dependencies.exitDoor.setUnlocked();
    gameState.timerRunning = true;

    this.startCountdown();
  }

  startCountdown() {
    let timeLeft = this.exitCountdown;
    this.dependencies.hud?.startTimer?.(timeLeft);

    this.exitTimer = setInterval(() => {
      timeLeft--;
      this.dependencies.hud?.updateTimer(timeLeft);

      if (timeLeft <= 0) {
        this.cleanupTimer();
        EventBus.emit('game:lose');
      }
    }, 1000);
  }

  cleanupTimer() {
    if (this.exitTimer) {
      clearInterval(this.exitTimer);
      this.exitTimer = null;
    }
    gameState.timerRunning = false;
  }

  winGame() {
    this.cleanupTimer();
    this.endGame("🍃 You Escaped the Maze!", 0x55ff55);
  }

  loseGame() {
    this.cleanupTimer();
    this.endGame("💀 Time's up! You are trapped forever!", 0xff5555);
  }

  endGame(message, color) {
    gameState.gameOver = true;
    gameState.movementLocked = true;
    
    this.dependencies.hud?.updateTimer(0);
    this.releasePlayerControls();
    this.endScreen.showResult(message, color);

    EventBus.emit('game:ended', { won: message.includes("Escaped") });
  }

  releasePlayerControls() {
    try {
      this.dependencies.player.controls.unlock();
      document.exitPointerLock?.();
      document.body.style.cursor = 'auto';
    } catch (error) {
      console.error("Failed to release controls:", error);
    }
  }

  resetGame() {
    this.cleanupTimer();
    this.startGame();
    EventBus.emit('game:restarted');
  }

  isExitActivated() {
    return this.exitActivated;
  }
}