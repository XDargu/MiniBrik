const versionMagic = 0x55;

function encodeGlobalSettings({
  lightPreset = 0,
  colorPalette = 0
} = {}) {
  return (
    (versionMagic) |
    ((lightPreset & 7) << 8) |
    ((colorPalette & 15) << 11)
  ) >>> 0;
}

function decodeGlobalSettings(v) {
  const magic = v & 0xFF;

  if (magic !== versionMagic) {
    return null; // This is a save from before we had global settings
  }

  return {
    lightPreset: (v >> 8) & 7,
    colorPalette: (v >> 11) & 15
  };
}

function packBrick(b) {
  const id = b.id & 31;
  const c  = b.c & 15; // 16 colors

  const x = (b.x + GRID_HALF) & 31;
  const z = (b.z + GRID_HALF) & 31;
  const y = b.y & 127;

  const r = b.r & 3;

  return (
    id |
    (c << 5) |
    (x << 9) |
    (z << 14) |
    (y << 19) |
    (r << 26)
  ) >>> 0;
}

function unpackBrick(v) {
  return {
    id: (v) & 31,
    c:  (v >> 5) & 15,

    x: ((v >> 9) & 31) - GRID_HALF,
    z: ((v >> 14) & 31) - GRID_HALF,

    y:  (v >> 19) & 127,
    r:  (v >> 26) & 3
  };
}

function encodeState(globalSettings, blockHistory) {
  const header = encodeGlobalSettings(globalSettings);

  const arr = [
    globalSettings,
    ...blockHistory.map(h =>
        packBrick({
          id: h.id,
          c: colorToIndex(h.c),
          x: h.x,
          y: h.y,
          z: h.z,
          r: (h.r / 90) & 3
        })
      )
    ]

  const buffer = new Uint32Array(arr);

  return base64urlEncode(buffer);
}

function base64urlEncode(uint32Array) {
  const bytes = new Uint8Array(uint32Array.buffer);

  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";

  const binary = atob(str);

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Uint32Array(bytes.buffer);
}

function decodeState(str) {
  const arr = base64urlDecode(str);

  if (arr.length === 0) return { settings: null, bricks: [] };

  const settings = decodeGlobalSettings(arr[0]) || defaultGlobalSettings;

  const bricks = Array.from(arr.slice(1)).map(v => {
    const b = unpackBrick(v);
    const def = BRICKS[b.id];

    return {
      id: b.id,
      c: indexToColor(b.c),
      x: b.x,
      y: b.y,
      z: b.z,
      w: def.w,
      d: def.d,
      r: b.r * 90,
      group: null
    };
  });

  return { settings, bricks };
}