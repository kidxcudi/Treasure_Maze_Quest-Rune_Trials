export const maze1 = {
  tileSize: 3,
  layout: [
    "#############",
    "#   #   r   #",
    "# # # ##### #",
    "#S#     #   #",
    "### ### # ###",
    "#     # #   #",
    "# ##### ### #",
    "#   T #   t #",
    "# ###R##### #",
    "# e #     E #",
    "#############",
  ],
  objects: {
    playerStart: { x: 1, z: 3 },
    exit: { x: 9, z: 9 },
    exitMechanism: { x: 3, z: 9 },
    runes: [
      { x: 5, z: 1, type: "rune_flight" },
      { x: 5, z: 8, type: "rune_blink" },
      { x: 5, z: 2, type: "rune_strength" },
      { x: 4, z: 5, type: "rune_speed" },
      { x: 6, z: 3, type: "rune_vision" },
    ],
    treasures: [
      { x: 1, z: 1 },
      { x: 3, z: 3 },
      { x: 9, z: 5 },
    ],
    easterEggs: [
      { x: 3, z: 2, type: "pass_through" },
      { x: 8, z: 7, type: "breakable" },
      { x: 4, z: 5, type: "low_wall" },
      { x: 5, z: 2, type: "quicksand" }
    ],
  },
};
