function encodeCoord(v) {
  return v + GRID_HALF;
}

function decodeCoord(v) {
  return v - GRID_HALF;
}

function packBrick(b) {
  const id = b.id & 31;
  const c  = b.c & 15; // 16 colors

  const x = (b.x + GRID_HALF) & 31;
  const z = (b.z + GRID_HALF) & 31;
  const y = b.y & 31;

  const r = b.r & 3;

  return (
    id |
    (c << 5) |
    (x << 9) |
    (z << 14) |
    (y << 19) |
    (r << 24)
  ) >>> 0;
}

function unpackBrick(v) {
  return {
    id: (v) & 31,
    c:  (v >> 5) & 15,

    x: ((v >> 9) & 31) - GRID_HALF,
    z: ((v >> 14) & 31) - GRID_HALF,

    y:  (v >> 19) & 31,
    r:  (v >> 24) & 3
  };
}

function encodeState(blockHistory) {
  const arr = blockHistory.map(h =>
    packBrick({
      id: h.id,
      c: colorToIndex(h.c),
      x: h.x,
      y: h.y,
      z: h.z,
      r: (h.r / 90) & 3
    })
  );

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

  return Array.from(arr).map(v => {
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
}