// src/ui/StartScreen.js

export class StartScreen {
  constructor() {
    this.el = this._createContainer();
    this.runeSymbols = this._getRuneSymbols();
    this.decryptionComplete = false;
    this.animationTimeout = null;
    this.onStart = null;

    this._buildHTMLStructure();
    document.body.appendChild(this.el);
    this._setupEventListeners();
  }

  _createContainer() {
    const container = document.createElement('div');
    container.id = 'start-screen';
    container.className = 'start-screen pixel-art';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, #0a1a1f 0%, #051015 100%);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.5s ease;
      pointer-events: none;
    `;
    return container;
  }

  _getRuneSymbols() {
    return [
      'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚻ', 'ᚼ', 'ᚽ',
      'ᚾ', 'ᚿ', 'ᛀ', 'ᛁ', 'ᛂ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛋ', 'ᛌ',
      'ᛍ', 'ᛎ', 'ᛏ', 'ᛐ', 'ᛑ', 'ᛒ', 'ᛓ', 'ᛔ', 'ᛕ', 'ᛖ', 'ᛗ', 'ᛘ',
      'ᛙ', 'ᛚ', 'ᛛ', 'ᛜ', 'ᛝ', 'ᛞ', 'ᛟ'
    ];
  }

  _buildHTMLStructure() {
    this.el.innerHTML = `
      <div class="jungle-vines">
        <div class="vine vine-1"></div>
        <div class="vine vine-2"></div>
        <div class="vine vine-3"></div>
      </div>

      <div class="stone-tablet">
        <div class="title-plaque">
          <h1 class="game-title" data-original="Treasure Maze Quest"></h1>
          <h2 class="game-subtitle" data-original="Rune Trials"></h2>
          <div class="rune-divider">ᛞᛟᛞ</div>
        </div>
        
        <div class="guide">
          <p class="game-desc" data-original="Unravel the Runes, Escape the Maze, Claim the Treasure."></p>

          <div class="guide-section">
            <h3 class="guide-title" data-original="Ancient Prophecy"></h3>
            <ul class="rune-list">
              <li data-original="Venture through the ancient maze's twisting corridors"></li>
              <li data-original="Locate and collect all three mystical treasures"></li>
              <li data-original="Collect magical runes to wield different spells"></li>
              <li data-original="Beware of deceptive runes that may hinder you"></li>
              <li data-original="Activate the exit mechanism to escape before time halts"></li>
            </ul>
          </div>

          <div class="controls-section">
            <h3 class="controls-title" data-original="Rune Mastery"></h3>
            <div class="controls-grid">
              <div class="control-item" data-original="W/A/S/D — Move"></div>
              <div class="control-item" data-original="Mouse — Look Around"></div>
              <div class="control-item" data-original="E — Interact / Pickup"></div>
              <div class="control-item" data-original="Q — Use Rune Ability"></div>
              <div class="control-item" data-original="Esc — Pause / Menu"></div>
            </div>
          </div>
        </div>

        <div class="start-prompt">
          <div class="glowing-rune">✧</div>
          <div class="hint-text" data-original="TOUCH THE RELIC TO BEGIN"></div>
        </div>
      </div>
    `;

    // Add CSS animations
    this._addStyleElement();
  }

  _addStyleElement() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes runePulse {
        0% { opacity: 0.3; transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.05); }
        100% { opacity: 0.3; transform: scale(0.95); }
      }
      @keyframes vineSway {
        0% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
        100% { transform: rotate(-2deg); }
      }
      .glowing-rune {
        animation: runePulse 2s infinite ease-in-out;
        font-size: 3rem;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  _getRandomRunes(count) {
    return Array.from({ length: count }, () => 
      this.runeSymbols[Math.floor(Math.random() * this.runeSymbols.length)]
    ).join('');
  }

  _decryptElement(element) {
    const originalText = element.getAttribute('data-original');
    if (!originalText) return;

    element.innerHTML = '';
    const textLength = originalText.length;
    const charDelay = 2000 / textLength;

    for (let i = 0; i < textLength; i++) {
      const span = document.createElement('span');
      span.className = 'pending-rune';
      span.textContent = this._getRandomRunes(1);
      element.appendChild(span);
    }

    let current = 0;
    const revealNext = () => {
      if (current >= textLength) {
        element.classList.add('revealed');
        return;
      }

      const child = element.children[current];
      child.textContent = originalText[current];
      child.classList.replace('pending-rune', 'revealed-char');

      current++;
      this.animationTimeout = setTimeout(revealNext, charDelay);
    };

    element.classList.add('decrypting');
    this.animationTimeout = setTimeout(revealNext, 100);
  }

  _animateTextDecryption() {
    const elements = Array.from(this.el.querySelectorAll('[data-original]'));
    const staggerDelay = 300;

    elements.forEach((element, index) => {
      setTimeout(() => {
        this._decryptElement(element);
      }, index * staggerDelay);
    });

    setTimeout(() => {
      const divider = this.el.querySelector('.rune-divider');
      if (divider) divider.textContent = this._getRandomRunes(3);
      this.decryptionComplete = true;
      this.el.style.pointerEvents = 'auto';
    }, elements.length * staggerDelay + 1000);
  }

  _setupEventListeners() {
    this.el.addEventListener('click', () => {
      if (!this.decryptionComplete) return;
      if (this.onStart) this.onStart();
      this.hide();
    });
  }

  show(onStartCallback) {
    this.onStart = onStartCallback;
    this.el.style.opacity = '1';
    this.el.style.pointerEvents = 'none';
    this.decryptionComplete = false;
    this._animateTextDecryption();
  }

  hide() {
    clearTimeout(this.animationTimeout);
    this.el.style.opacity = '0';
    this.el.style.pointerEvents = 'none';
    setTimeout(() => {
      if (this.el.parentNode) {
        document.body.removeChild(this.el);
      }
    }, 500);
  }
}