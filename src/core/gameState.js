// gameState.js

export const gameState = {
  equippedRune: null,
  treasuresCollected: 0,
  totalTreasures: 4,
  exitDoorOpen: false,
  timerRunning: false,
  timeLeft: 300, // seconds

  reset() {
    this.equippedRune = null;
    this.treasuresCollected = 0;
    this.exitDoorOpen = false;
    this.timerRunning = false;
    this.timeLeft = 300;
  }
};
