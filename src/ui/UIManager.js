import { HUD } from './hud/HUD.js';
import { Tooltip } from './hud/Tooltip.js';
import { StartScreen } from './screens/StartScreen.js';
import { EndScreen } from './screens/EndScreen.js';

class UIManager {
  constructor() {
    this._components = {
      hud: new HUD(),
      tooltip: new Tooltip(),
      startScreen: new StartScreen(),
      endScreen: new EndScreen()
    };
    this._currentState = 'start';
  }

  // Public API
  showStart(onStartCallback) {
    this._components.startScreen.show(onStartCallback);
    this._currentState = 'start';
  }

  startGame() {
    this._components.hud.show();
    this._components.startScreen.hide();
    this._currentState = 'game';
  }

  endGame(results) {
    this._components.hud.hide();
    this._components.endScreen.showResults(
      results.message,
      results.playtime,
      results.score
    );
    this._currentState = 'end';
  }

  showTooltip(text, options = {}) {
    if (options.worldPosition) {
      this._components.tooltip.showWorld(text, options.worldPosition, options.duration);
    } else {
      this._components.tooltip.showTop(text, options.duration);
    }
  }

  hideTooltip() {
    this._components.tooltip.hideWorld(); 
  }

  updateHUD(data) {
    this._components.hud.update(data);
  }

  showMessage(text, duration = 3000) {
    this._components.hud.showMessage(text, duration);
  }

  // State management
  get currentState() {
    return this._currentState;
  }

  // Cleanup
  dispose() {
    Object.values(this._components).forEach(component => {
      if (typeof component.dispose === 'function') {
        component.dispose();
      }
    });
  }
}

export const uiManager = new UIManager();