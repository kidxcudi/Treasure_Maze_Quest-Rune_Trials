// src/core/GameManager.js
import { gameState } from './gameState.js';
import { Timer } from './Timer.js';

export class GameManager {
  constructor(hud, scene, player, exitDoor) {
    this.hud = hud;
    this.scene = scene;
    this.player = player;
    this.exitDoor = exitDoor;
    this.timer = new Timer(this.onTimerEnd.bind(this), this.hud);
  }

  startGame() {
    gameState.reset();
    this.hud.showMessage("Find the exit and use your rune wisely...");
    this.hud.updateRuneDisplay(null);
    this.timer.stop();
    this.hud.updateTimer(gameState.timeLeft);
  }

  triggerExitTimer() {
    if (!gameState.timerRunning) {
      this.hud.showMessage("The exit is open! Hurry!");
      this.timer.start(gameState.timeLeft);
      gameState.timerRunning = true;
      this.exitDoor.unlock();
    }
  }

  onTimerEnd() {
    gameState.timerRunning = false;
    this.hud.showEndScreen(false); // show lose
  }

  winGame() {
    this.timer.stop();
    this.hud.showEndScreen(true); // show win
  }

  resetGame() {
    this.startGame(); // you can expand this later
  }
}
