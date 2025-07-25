export const RuneTypes = {
  // === Positive Runes ===
  rune_flight: {
    label: "Valkyrie's Wings",
    icon: "ᛉ",
    color: "#9b59b6", // Lighter mystical purple
    description: "Fly over gaps and obstacles for some time.",
  },

  rune_blink: {
    label: "Bifrost Step",
    icon: "ᚱ",
    color: "#00bfff", // Brighter Bifrost blue
    description: "Teleport instantly to any visible location.",
  },

  rune_strength: {
    label: "Thor's Might",
    icon: "ᚢ",
    color: "#e53935", // Mjolnir red
    description: "Destroy weak walls and breakable objects with one hit.",
  },

  rune_speed: {
    label: "Sleipnir's Gallop",
    icon: "ᛋ",
    color: "#ffd700", // Mythic gold
    description: "Move at incredible speed for some time.",
  },

  rune_vision: {
    label: "Heimdall's Sight",
    icon: "ᚨ",
    color: "#2ecc71", // Emerald green (better for "all-seeing" vision)
    description: "Reveal hidden traps and secrets temporarily.",
  },

  // === Trap Runes ===
  rune_confusion: {
    label: "Loki's Mirage",
    icon: "ᛈ",
    color: "#ff7043", // Warning orange
    description: "TRAP: Inverts your movement controls for some time.",
    isTrap: true,
  },

  rune_pathblock: {
    label: "Loki's Mirage",
    icon: "ᛁ",
    color: "#b3e5fc", // Frost blue
    description: "TRAP: Blocks vision of your path (movement unaffected).",
    isTrap: true,
  },

  rune_silence: {
    label: "Hel's Shroud",
    icon: "ᚺ",
    color: "#607d8b", // Deep silence gray
    description: "TRAP: Disables all sound and UI temporarily.",
    isTrap: true,
  },

  rune_gravity: {
    label: "Jormungandr's Grasp",
    icon: "ᚦ",
    color: "#6a1b9a", // Serpent purple
    description: "TRAP: Completely stops your movement for some time.",
    isTrap: true,
  },

  rune_void: {
    label: "Fenrir's Shadow",
    icon: "ᚾ",
    color: "#000000", // Absolute void black
    description: "TRAP: Hides all visuals temporarily.",
    isTrap: true,
  }
};