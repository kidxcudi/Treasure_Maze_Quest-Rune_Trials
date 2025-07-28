// gameState.js

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.equippedRune = null;
    this.treasuresCollected = 0;
    this.totalTreasures = 3;
    this.exitDoorOpen = false;
    this.timerRunning = false;
    this.timeLeft = 300; // seconds
    this.gameOver = false;
    this.movementLocked = false;
  }

  collectTreasure() {
    this.treasuresCollected += 1;
    if (this.treasuresCollected >= this.totalTreasures) {
      this.openExit();
    }
  }

  openExit() {
    this.exitDoorOpen = true;
  }

  lockMovement() {
    this.movementLocked = true;
  }

  unlockMovement() {
    this.movementLocked = false;
  }

  endGame() {
    this.gameOver = true;
    this.timerRunning = false;
  }
}
