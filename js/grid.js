const occupied = new Set();

const key = (x, y, z) => `${x},${y},${z}`;
const isOccupied = (x, y, z) => occupied.has(key(x, y, z));
const setOccupied = (x, y, z) => occupied.add(key(x, y, z));

function columnHeight(x, y, z) {
  while (isOccupied(x, y, z)) y++;
  return y;
}

function getFootprint(brickId, rot) {
  const b = BRICKS[brickId];
  return rot % 180 === 0 ? [b.w, b.d] : [b.d, b.w];
}

function computePlacement(x, y, z, w, d) {
  let maxY = 0,
    support = false;

  for (let i = 0; i < w; i++)
    for (let j = 0; j < d; j++) {
      maxY = Math.max(maxY, columnHeight(x + i, y, z + j));
    }

  for (let i = 0; i < w; i++)
    for (let j = 0; j < d; j++) {
      if (isOccupied(x + i, maxY, z + j)) return { valid: false, y: 0 };
    }

  for (let i = 0; i < w; i++)
    for (let j = 0; j < d; j++) {
      if (isOccupied(x + i, maxY - 1, z + j)) support = true;
    }

  if (maxY === 0) support = true;
  return { valid: support, y: maxY };
}

function computeBrickPos(x, y, z, w, d, rot) {
  const signX = rot == 90 ? -1 : 1;
  const signZ = rot == 180 ? -1 : 1;
  const offX = rot == 90 ? 1 : 0;
  const offZ = rot == 180 ? 1 : 0;
  const extraX = rot == 180 ? -Math.floor(w - 1) : 0;
  const extraZ = rot == 270 ? -Math.floor(d - 1) : 0;

  return {
    x: x + (w / 2) * signX + offX + extraX,
    y: y + 0.5,
    z: z + (d / 2) * signZ + offZ + extraZ,
  };
}

function getOccupancy(x, y, z, w, d, rot) {
  let cells = [];
  const brickPos = computeBrickPos(x, y, z, w, d, rot);
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < d; j++) {
      cells.push({
        x: snap(brickPos.x + i - w / 2),
        y,
        z: snap(brickPos.z + j - d / 2),
      });
    }
  }
  return cells;
}

function occupy(x, y, z, w, d) {
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < d; j++) {
      setOccupied(snap(x + i - w / 2), y, snap(z + j - d / 2));
    }
  }
}

function shiftBlock(body) {
  const shiftVal = (Math.random() * 2 - 1) * shift;
  body.position.x += shiftVal;
  body.position.z += shiftVal;
  body.rotation.y += shiftVal;
}
