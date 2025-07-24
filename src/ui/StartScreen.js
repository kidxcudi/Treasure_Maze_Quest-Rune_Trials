/**
 * 🏺 STONE TABLET START SCREEN 🏺  
 * A pixel-art UI inspired by ancient jungle ruins  
 * Carved stone, vine overlays, glowing runes  
 * No images - pure CSS magic & unicode runes  
 */
export class StartScreen {
  constructor() {
    // 🪨 Base stone tablet element  
    this.el = document.createElement('div');
    this.el.id = 'start-screen';
    this.el.className = 'start-screen pixel-art';

    // 🔮 Mystical Elder Futhark runes  
    this.runeSymbols = [
      'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚻ', 'ᚼ', 'ᚽ',
      'ᚾ', 'ᚿ', 'ᛀ', 'ᛁ', 'ᛂ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛋ', 'ᛌ',
      'ᛍ', 'ᛎ', 'ᛏ', 'ᛐ', 'ᛑ', 'ᛒ', 'ᛓ', 'ᛔ', 'ᛕ', 'ᛖ', 'ᛗ', 'ᛘ',
      'ᛙ', 'ᛚ', 'ᛛ', 'ᛜ', 'ᛝ', 'ᛞ', 'ᛟ'
    ];

    this.decryptionComplete = false;
    this.animationTimeout = null;

    this.el.innerHTML = `
      <div class="jungle-vines">
        <div class="vine-1"></div>
        <div class="vine-2"></div>
        <div class="vine-3"></div>
      </div>

      <div class="stone-tablet">
        <!-- 🏆 Title plaque (carved stone + moss) -->
        <div class="title-plaque">
          <h1 class="game-title" data-original="Treasure Maze Quest"></h1>
          <h2 class="game-subtitle" data-original="Rune Trials"></h2>
          <div class="rune-divider">ᛞᛟᛞ</div> <!-- Default runes -->
        </div>
        
        <div class="ancient-scroll">
          <p class="game-desc" data-original="Unravel the Runes, Escape the Maze, Claim the Treasure."></p>

          <div class="guide-section">
            <h3 class="guide-title" data-original=""></h3>
            <ul class="rune-list">
              <li data-original="Venture through the ancient maze's twisting corridors"></li>
              <li data-original="Locate and collect all three mystical treasures"></li>
              <li data-original="Collect magical runes to wield different spells"></li>
              <li data-original="Beware of deceptive runes that may hinder you"></li>
              <li data-original="Activate the exit mechanism to escape before time halts"></li>
              <li data-original="Find all treasures hidden in the maze"></li>
            </ul>
          </div>

          <div class="controls-section">
            <h3 class="controls-title" data-original=""></h3>
            <div class="controls-grid">
              <div class="control-item" data-original="W/A/S/D — Move"></div>
              <div class="control-item" data-original="Mouse — Look Around"></div>
              <div class="control-item" data-original="E — Interact / Pickup"></div>
              <div class="control-item" data-original="Q — Use Rune Ability"></div>
              <div class="control-item" data-original="Esc — Pause / Menu"></div>
            </div>
          </div>
        </div>

        <!-- ✨ Glowing relic prompt -->
        <div class="start-prompt">
          <div class="glowing-rune">✧</div> <!-- Pulsing CSS animation -->
          <div class="hint-text" data-original="TOUCH THE RELIC TO BEGIN"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.el);
    this._handleClick = this._handleClick.bind(this);
    this.onStart = null;
  }

  /**  
   * 🌟 Get random runes for animation  
   * @param {number} count - How many runes to generate  
   * @returns {string} - Mystical symbols  
   */  
  _getRandomRunes(count) {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += this.runeSymbols[Math.floor(Math.random() * this.runeSymbols.length)];
    }
    return result;
  }

  /**  
   * 🔓 Decrypt text (rune animation → revealed)  
   * @param {HTMLElement} element - Target with data-original  
   */  
  _decryptElement(element) {
    const originalText = element.getAttribute('data-original');
    const textLength = originalText.length;

    element.innerHTML = '';
    for (let i = 0; i < textLength; i++) {
      const span = document.createElement('span');
      span.className = 'pending-rune';
      span.textContent = this.runeSymbols[Math.floor(Math.random() * this.runeSymbols.length)];
      element.appendChild(span);
    }

    const children = element.children;
    let current = 0;
    const totalTime = 2000;
    const charDelay = totalTime / textLength;

    const revealNext = () => {
      if (current >= textLength) {
        element.classList.remove('decrypting');
        element.classList.add('revealed');
        return;
      }

      children[current].textContent = originalText[current];
      children[current].className = 'revealed-char';
      children[current].style.animation = 'none';

      current++;
      this.animationTimeout = setTimeout(revealNext, charDelay);
    };

    element.classList.add('decrypting');
    this.animationTimeout = setTimeout(revealNext, 100);
  }

  /**  
   * 🌀 Animate all text decryption (staggered)  
   */  
  _animateTextDecryption() {
    const elements = this.el.querySelectorAll('[data-original]');
    let delay = 0;
    const staggerDelay = 400;

    elements.forEach((element) => {
      setTimeout(() => {
        this._decryptElement(element);
      }, delay);
      delay += staggerDelay;
    });

    setTimeout(() => {
      const divider = this.el.querySelector('.rune-divider');
      if (divider) divider.textContent = this._getRandomRunes(3);
    }, delay);

    setTimeout(() => {
      this.decryptionComplete = true;
      const hintText = this.el.querySelector('.hint-text');
      if (hintText) hintText.style.visibility = 'visible';
    }, delay + 1000);
  }

  /**  
   * 🏹 Show the screen (with callback)  
   * @param {Function} onStartCallback - Fires on relic touch  
   */  
  show(onStartCallback) {
    this.onStart = onStartCallback;
    this.el.classList.add('visible');

    const hintText = this.el.querySelector('.hint-text');
    if (hintText) hintText.style.visibility = 'hidden';

    this._animateTextDecryption();

    const clickHandler = (e) => {
      if (!this.decryptionComplete) return;
      if (this.onStart) this.onStart();
      this.hide();
      window.removeEventListener('click', clickHandler);
    };

    window.addEventListener('click', clickHandler);
  }

  /**  
   * 🌑 Hide the screen (cleanup)  
   */  
  hide() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
    this.el.classList.remove('visible');
  }

  // 🖱️ Handle relic click  
  _handleClick() {
    if (this.onStart) this.onStart();
    this.hide();
  }
}