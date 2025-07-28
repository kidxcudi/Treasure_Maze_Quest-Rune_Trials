// src/runes/RuneTypes.js

/**
 * Norse Rune Configuration System
 * - Organized by positive/trap categories
 * - Enhanced type safety
 * - Better visual hierarchy
 * - Optimized for UI rendering
 */

export const RUNE_CATEGORIES = {
  POSITIVE: 'positive',
  TRAP: 'trap'
};

export const RuneTypes = Object.freeze({
  // ===== Positive Runes =====
  'rune_flight': {
    id: 'rune_flight',
    label: "Valkyrie's Wings",
    icon: "ᛉ",
    color: "#9b59b6",
    description: "Fly over gaps and obstacles for some time.",
    category: RUNE_CATEGORIES.POSITIVE,
    visualEffects: ['particles', 'glow']
  },

  'rune_blink': {
    id: 'rune_blink',
    label: "Bifrost Step",
    icon: "ᚱ",
    color: "#00bfff",
    description: "Teleport instantly to any visible location.",
    category: RUNE_CATEGORIES.POSITIVE,
    visualEffects: ['shimmer', 'lightning']
  },

  'rune_strength': {
    id: 'rune_strength',
    label: "Thor's Might",
    icon: "ᚢ",
    color: "#e53935",
    description: "Destroy weak walls and breakable objects with one hit.",
    category: RUNE_CATEGORIES.POSITIVE,
    visualEffects: ['pulse', 'impact']
  },

  'rune_speed': {
    id: 'rune_speed',
    label: "Sleipnir's Gallop",
    icon: "ᛋ",
    color: "#ffd700",
    description: "Move at incredible speed for some time.",
    category: RUNE_CATEGORIES.POSITIVE,
    visualEffects: ['trail', 'speedLines']
  },

  'rune_vision': {
    id: 'rune_vision',
    label: "Heimdall's Sight",
    icon: "ᚨ",
    color: "#2ecc71",
    description: "Reveal hidden traps and secrets temporarily.",
    category: RUNE_CATEGORIES.POSITIVE,
    visualEffects: ['aura', 'scan']
  },

  // ===== Trap Runes =====
  'rune_confusion': {
    id: 'rune_confusion',
    label: "Hymir's Hangover",
    icon: "ᛈ",
    color: "#ff7043",
    description: "TRAP: Inverts your movement controls for some time.",
    category: RUNE_CATEGORIES.TRAP,
    visualEffects: ['distortion'],
    isTrap: true
  },

  'rune_pathblock': {
    id: 'rune_pathblock',
    label: "Loki's Mirage",
    icon: "ᛁ",
    color: "#b3e5fc",
    description: "TRAP: Blocks vision of your path (movement unaffected).",
    category: RUNE_CATEGORIES.TRAP,
    visualEffects: ['fog'],
    isTrap: true
  },

  'rune_silence': {
    id: 'rune_silence',
    label: "Hel's Shroud",
    icon: "ᚺ",
    color: "#607d8b",
    description: "TRAP: Disables all sound and UI temporarily.",
    category: RUNE_CATEGORIES.TRAP,
    visualEffects: ['mute'],
    isTrap: true
  },

  'rune_gravity': {
    id: 'rune_gravity',
    label: "Jormungandr's Grasp",
    icon: "ᚦ",
    color: "#6a1b9a",
    description: "TRAP: Completely stops your movement for some time.",
    category: RUNE_CATEGORIES.TRAP,
    visualEffects: ['weight'],
    isTrap: true
  },

  'rune_void': {
    id: 'rune_void',
    label: "Fenrir's Shadow",
    icon: "ᚾ",
    color: "#000000",
    description: "TRAP: Hides all visuals temporarily.",
    category: RUNE_CATEGORIES.TRAP,
    visualEffects: ['darkness'],
    isTrap: true
  }
});

// Utility Functions
export const getRuneById = (id) => RuneTypes[id];

export const getRunesByCategory = (category) =>
  Object.values(RuneTypes).filter(rune => rune.category === category);

export const isTrapRune = (rune) =>
  rune?.category === RUNE_CATEGORIES.TRAP;

// Color Palette Constants
export const RUNE_COLORS = Object.freeze({
  POSITIVE: "#2ecc71",
  TRAP: "#e74c3c",
  DEFAULT: "#ecf0f1"
});
