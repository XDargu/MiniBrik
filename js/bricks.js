const brickH = 3;

const BRICKS = {
  0: { name: "2x2", w:2, d:2, h: brickH, type:"box" },
  1: { name: "2x3", w:2, d:3, h: brickH, type:"box" },
  2: { name: "2x4", w:2, d:4, h: brickH, type:"box" },

  3: { name: "1x1", w:1, d:1, h: brickH, type:"box" },
  4: { name: "1x2", w:1, d:2, h: brickH, type:"box" },
  5: { name: "1x3", w:1, d:3, h: brickH, type:"box" },
  6: { name: "1x4", w:1, d:4, h: brickH, type:"box" },
  7: { name: "1x8", w:1, d:8, h: brickH, type:"box" },

  8: { name: "1x1 Flat", w:1, d:1, h: 1, type:"box" },
  9: { name: "1x2 Flat", w:1, d:2, h: 1, type:"box" },

  10: { name: "2x3 Flat", w:2, d:3, h: 1, type:"box" },
  11: { name: "2x4 Flat", w:2, d:4, h: 1, type:"box" },

  12: { name: "1x2 Tile", w:1, d:2, h: 1, type:"tile" },
  13: { name: "1x1 Tile", w:1, d:1, h: 1, type:"tile" },

  14: { name: "2x2 Round", w:2, d:2, h: brickH, type:"cylinder" },
  15: { name: "1x1 Round", w:1, d:1, h: brickH, type:"cylinder", hollowStud: true },
  
  16:{ name: "1x1 Cone", w:1, d:1, h: brickH, type:"cone", hollowStud: true },
  17:{ name: "1x4 Bar", w:1, d:1, h: 4*brickH,  type:"bar" },

  18:{ name: "Dish", w:1, d:1, h:2,  type:"dish", hollowStud: true },
};

const COLORS = [
  // basic
  0xe74c3c, // soft red
  0x3b82f6, // modern blue
  0x22c55e, // clean green
  0xfbbf24, // warm yellow
  0xffffff, // White

  // LEGO "modern architectural / modular" palette (approx BrickLink)
  0xa0bc9a, // Sand Green
  0xa0a5a9, // Light Bluish Gray
  0x6c6e68, // Dark Bluish Gray
  0xd7c59a, // Dark Tan
  0xf2d2a9, // Nougat
  0xc7a57b, // Medium Nougat
  0x6b8ba4, // Sand Blue
  0x607848, // Olive Green
  0x3a3a3a, // Black
  0xffc94a  // Bright Light Orange
];

function colorToIndex(hex) {
  return COLORS.indexOf(hex);
}

function indexToColor(i) {
  return COLORS[i] ?? COLORS[0];
}