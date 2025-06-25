// src/runes/RuneEffects.js

export const RuneEffects = {
  rune_flight: {
    activate(player, scene, hud) {
      const obj = player.controls.getObject();
      obj.position.y += 15;

      hud?.showMessage("You float above the ground...");

      // Optional: gently bring player back down
      setTimeout(() => {
        obj.position.y -= 15;
        hud?.showMessage("Flight fades.");
      }, 3000);
    }
  },

  rune_break: {
    activate(player, scene, hud) {
      hud?.showMessage("The rune glows... ready to break walls!");
      // Actual breaking is handled in interactions.js when raycasting hits breakable wall
    }
  }
};
