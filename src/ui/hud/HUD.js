// src/ui/HUD.js
import { RuneTypes } from '../../entities/runes/RuneTypes.js';

// CSS Constants
const HUD_STYLES = {
  BASE: {
    marginBottom: '8px',
    fontSize: '18px',
    color: '#fff'
  },
  TIMER: {
    fontSize: '20px',
    marginBottom: '10px',
    color: '#ffee88',
    fontWeight: 'bold'
  },
  MESSAGE: {
    transition: 'opacity 0.5s ease'
  }
};

export class HUD {
  constructor() {
    this.uiContainer = document.getElementById('ui-overlay') || this._createUIContainer();
    this._msgTimeout = null;
    this._initElements();
    this._applyStyles();
  }

  _createUIContainer() {
    const container = document.createElement('div');
    container.id = 'ui-overlay';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.left = '20px';
    container.style.zIndex = '1000';
    document.body.appendChild(container);
    return container;
  }

  _initElements() {
    this.runeDisplay = this._createElement('rune-display');
    this.timerDisplay = this._createElement('timer-display');
    this.messageDisplay = this._createElement('status-message');
    this.crosshair = this._createCrosshair();
  }

  _createElement(id) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      Object.assign(el.style, HUD_STYLES.BASE);
      this.uiContainer.appendChild(el);
    }
    return el;
  }

  _createCrosshair() {
    const crosshair = document.createElement('div');
    crosshair.id = 'crosshair';
    crosshair.style.position = 'fixed';
    crosshair.style.top = '50%';
    crosshair.style.left = '50%';
    crosshair.style.transform = 'translate(-50%, -50%)';
    crosshair.style.width = '20px';
    crosshair.style.height = '20px';
    crosshair.style.borderRadius = '50%';
    crosshair.style.border = '2px solid rgba(255, 255, 255, 0.8)';
    crosshair.style.pointerEvents = 'none';
    document.body.appendChild(crosshair);
    return crosshair;
  }

  _applyStyles() {
    Object.assign(this.timerDisplay.style, HUD_STYLES.TIMER);
    Object.assign(this.messageDisplay.style, HUD_STYLES.MESSAGE);
    this.messageDisplay.style.opacity = '0';
  }

  updateRuneDisplay(runeName) {
    if (!runeName) {
      this.runeDisplay.textContent = 'No Rune';
      this.runeDisplay.style.color = '#aaa';
      return;
    }

    const runeData = RuneTypes[runeName];
    if (runeData) {
      this.runeDisplay.textContent = `Rune held: ${runeData.label}`;
      this.runeDisplay.style.color = runeData.color || '#fff';
    } else {
      this.runeDisplay.textContent = runeName;
      this.runeDisplay.style.color = '#fff';
    }
  }

  startTimer(seconds) {
    this.timerDisplay.style.display = 'block';
    this.updateTimer(seconds);
  }

  updateTimer(secondsLeft) {
    if (secondsLeft <= 0) {
      this.timerDisplay.textContent = '';
      this.timerDisplay.style.display = 'none';
      return;
    }

    const mins = Math.floor(secondsLeft / 60);
    const secs = String(secondsLeft % 60).padStart(2, '0');
    this.timerDisplay.textContent = `Time Left: ${mins}:${secs}`;
    this.timerDisplay.style.color = secondsLeft <= 10 ? '#ff5555' : '#ffee88';
  }

  showMessage(text, duration = 3000) {
    clearTimeout(this._msgTimeout);
    this.messageDisplay.textContent = text;
    this.messageDisplay.style.opacity = '1';

    if (duration > 0) {
      this._msgTimeout = setTimeout(() => {
        this.messageDisplay.style.opacity = '0';
      }, duration);
    }
  }

  toggle(show) {
    this.uiContainer.style.display = show ? 'block' : 'none';
    this.crosshair.style.display = show ? 'block' : 'none';
  }

  hide() {
    this.toggle(false);
  }

  show() {
    this.toggle(true);
  }

  update(data) {
    if (!data) return;

    if ('rune' in data) {
      this.updateRuneDisplay(data.rune);
    }

    if ('treasuresCollected' in data) {
      this.runeDisplay.textContent += ` | Treasures: ${data.treasuresCollected}`;
    }

    if ('timeLeft' in data) {
      if (data.timeLeft !== null && data.timeLeft !== undefined) {
        this.updateTimer(data.timeLeft);
      } else {
        this.timerDisplay.textContent = '';
        this.timerDisplay.style.display = 'none';
      }
    }
  }


  dispose() {
    clearTimeout(this._msgTimeout);
    if (this.uiContainer.parentNode) {
      document.body.removeChild(this.uiContainer);
    }
    if (this.crosshair.parentNode) {
      document.body.removeChild(this.crosshair);
    }
  }
}