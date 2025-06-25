// gameState.js

export const gameState = {
  equippedRune: null,
  treasuresCollected: 0,
  totalTreasures: 4,
  exitDoorOpen: false,
  timerRunning: false,
  timeLeft: 300, // seconds
  gameOver: false, // ✅ ADD THIS
  movementLocked: false,

  reset() {
    this.equippedRune = null;
    this.treasuresCollected = 0;
    this.exitDoorOpen = false;
    this.timerRunning = false;
    this.timeLeft = 300;
    this.gameOver = false; // ✅ Reset it
    this.movementLocked = false; // ✅ Reset movement lock
  }
};
