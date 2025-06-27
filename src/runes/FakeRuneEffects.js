export const FakeRuneEffects = {
  rune_confusion: {
    onEquip(player, gameState, hud) {
      hud?.showMessage("Your thoughts scramble... Controls reversed!");
      player.invertControls(10); // apply immediate effect

      player.applyEffectDuration("confusion", 10, () => {
        // Clear equipped rune and update HUD after duration
        gameState.equippedRune = null;
        hud?.updateRuneDisplay(null);
      });
    },
  },

  rune_pathblock: {
    onEquip(player, gameState, hud, maze) {
      hud?.showMessage("The walls shift... A path is blocked.");
     maze.blockAllPaths(10); // block path immediately

      player.applyEffectDuration("pathblock", 10, () => {
        // Clear equipped rune and update HUD after duration
        gameState.equippedRune = null;
        hud?.updateRuneDisplay(null);
      });
    },
  },

  rune_silence: {
    onEquip(player, gameState, hud, uiManager) {
      hud?.hide();
      // uiManager?.disableAudio();

      player.applyEffectDuration("silence", 10, () => {
        hud?.show();
        // uiManager?.enableAudio();
        hud?.showMessage("Silence fades...");

        gameState.equippedRune = null;
        hud?.updateRuneDisplay(null);
      });
    },
  },

  rune_gravity: {
    onEquip(player, gameState, hud) {
      hud?.showMessage("A heavy force slams you to the ground!");
      player.stunMovement(5); // apply immediate effect

      player.applyEffectDuration("gravity_stun", 5, () => {
        // Clear equipped rune and update HUD after duration
        gameState.equippedRune = null;
        hud?.updateRuneDisplay(null);
      });
    },
  },

  rune_void: {
  onEquip(player, gameState, hud, scene) {
    hud?.showMessage("A void swallows your vision!");

    const affectedMeshes = [];

    // Hide all meshes except designated fake walls
    scene.traverse(obj => {
      if (obj.isMesh && obj.visible && !obj.userData.isFakeWall) {
        obj.visible = false;
        affectedMeshes.push(obj);
      }
    });

    // Show dark overlay
    const overlay = document.getElementById('vision-overlay');
    if (overlay) overlay.style.opacity = '0.95';

    player.disableVision = true;

    player.applyEffectDuration("vision_blind", 7, () => {
      // Restore visibility
      affectedMeshes.forEach(obj => obj.visible = true);
      player.disableVision = false;

      // Hide overlay
      if (overlay) overlay.style.opacity = '0';

      hud?.showMessage("Your vision returns.");
      gameState.equippedRune = null;
      hud?.updateRuneDisplay(null);
    });
  }
},
};
