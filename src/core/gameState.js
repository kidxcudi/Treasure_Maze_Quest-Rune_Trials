// src/core/state/GameState.js
import { RuneTypes } from '../entities/runes/RuneTypes.js';
import { EventBus } from '../core/utils/EventBus.js'; // adjust path as needed

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this._equippedRune = null;
    this._treasuresCollected = 0;
    this._totalTreasures = 3;
    this._exitDoorOpen = false;
    this._timerRunning = false;
    this._timeLeft = 300;
    this._gameOver = false;
    this._movementLocked = false;
    this._playerStats = {
      runesUsed: 0,
      wallsBroken: 0,
      timePlayed: 0
    };
  }

  // Getters and setters for controlled access
  get equippedRune() {
    return this._equippedRune;
  }

  set equippedRune(rune) {
    if (rune && !RuneTypes[rune]) {
      console.warn(`Invalid rune: ${rune}`);
      return;
    }
    this._equippedRune = rune;
    EventBus.emit('rune:changed', rune);
  }

  get treasuresCollected() {
    return this._treasuresCollected;
  }

  set treasuresCollected(count) {
    this._treasuresCollected = Math.min(count, this._totalTreasures);
    if (this._treasuresCollected === this._totalTreasures) {
      EventBus.emit('treasures:all-collected');
    }
  }

  // Other getters/setters...
  get gameOver() {
    return this._gameOver;
  }

  set gameOver(value) {
    this._gameOver = value;
    EventBus.emit(value ? 'game:over' : 'game:restarted');
  }

  // State modification methods
  collectTreasure() {
    this.treasuresCollected++;
    this._playerStats.timePlayed = performance.now() - this._gameStartTime;
  }

  useRune() {
    if (this._equippedRune) {
      this._playerStats.runesUsed++;
      this.equippedRune = null;
    }
  }

  // Serialization for saving
  serialize() {
    return {
      version: 1,
      stats: this._playerStats,
      lastRune: this._equippedRune,
      timestamp: Date.now()
    };
  }

  // Deserialization for loading
  deserialize(data) {
    if (data.version !== 1) return false;
    this._playerStats = data.stats || {};
    this._equippedRune = data.lastRune || null;
    return true;
  }

  startGameTimer() {
  this._gameStartTime = performance.now();
}

get playTime() {
  return (performance.now() - this._gameStartTime) / 1000;
}
validateState() {
  return this._treasuresCollected <= this._totalTreasures && 
         (!this._equippedRune || RuneTypes[this._equippedRune]);
}
}

// Singleton instance
export const gameState = new GameState();

// Event constants
export const GAME_EVENTS = {
  TREASURE_COLLECTED: 'treasure:collected',
  RUNE_CHANGED: 'rune:changed',
  GAME_OVER: 'game:over',
  GAME_RESET: 'game:reset'
};