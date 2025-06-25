// src/ui/HUD.js

import { gameState } from '../core/gameState.js';

export class HUD {
  constructor() {
    this.runeDisplay = this._createElement('rune-display');
    this.timerDisplay = this._createElement('timer-display');
    this.messageDisplay = this._createElement('status-message');
  }

  _createElement(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.marginBottom = '8px';
      el.style.fontSize = '18px';
      document.getElementById('ui-overlay').appendChild(el);
    }
    return el;
  }

  updateRuneDisplay(runeName) {
    this.runeDisplay.textContent = runeName
      ? `Rune: ${runeName.replace('rune_', '')}`
      : 'No Rune';
  }

  updateTimer(secondsLeft) {
    const mins = Math.floor(secondsLeft / 60);
    const secs = Math.floor(secondsLeft % 60).toString().padStart(2, '0');
    this.timerDisplay.textContent = `Time: ${mins}:${secs}`;
  }

  showMessage(text, duration = 3000) {
    this.messageDisplay.textContent = text;
    this.messageDisplay.style.opacity = 1;

    clearTimeout(this._msgTimeout);
    this._msgTimeout = setTimeout(() => {
      this.messageDisplay.style.opacity = 0;
    }, duration);
  }
}
