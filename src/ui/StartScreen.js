export class StartScreen {
  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'start-screen';
    this.el.innerHTML = `
      <div class="start-container">
        <h1>Treasure Maze Quest</h1>
        <h2>Embark on a Mystical Journey</h2>
        <div class="guide">
          <h2>The Path Ahead</h2>
          <ul>
            <li>Venture  through the ancient maze's twisting corridors</li>
            <li>Locate and collect all three mystical treasures</li>
            <li>Collect magical runes to wield different spells</li>
            <li>Beware of deceptive runes that may hinder you</li>
            <li>Activate the exit mechanism to escape before time halts</li>
            <li>Find all treasures hidden in the maze</li>
          </ul>
          <div class="controls">
            <div><strong>WASD</strong> – Move</div>
            <div><strong>Click</strong> – Interact</div>
            <div><strong>Mouse</strong> – Look around</div>
            <div><strong>R</strong> – Use rune</div>
          </div>
        </div>
        <h3>Click anywhere to begin your quest...</h3>
      </div>
    `;
    document.body.appendChild(this.el);

    this._handleClick = this._handleClick.bind(this);
    this.onStart = null;
  }

  show(onStartCallback) {
    this.onStart = onStartCallback;
    this.el.classList.add('visible');
    this.el.addEventListener('click', this._handleClick);
  }

  hide() {
    this.el.classList.remove('visible');
    this.el.removeEventListener('click', this._handleClick);
  }

  _handleClick(e) {
    if (this.onStart) this.onStart();
    this.hide();
  }
}
