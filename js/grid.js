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

function computePlacement(x, y, z, w, d, h, rot) {
  const baseCells = getOccupancy(x, y, z, w, d, 1, rot);

  let maxY = 0;
  let support = false;

  // Find highest column under footprint
  for (const c of baseCells) {
    maxY = Math.max(maxY, columnHeight(c.x, y, c.z));
  }

  // Check FULL volume collision
  const fullCells = getOccupancy(x, maxY, z, w, d, h, rot);

  for (const c of fullCells) {
    if (isOccupied(c.x, c.y, c.z)) {
      return { valid: false, y: 0 };
    }
  }

  // Support check (only bottom layer matters)
  for (const c of baseCells) {
    if (isOccupied(c.x, maxY - 1, c.z)) {
      support = true;
    }
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
    y: y*0.3 + 0.5,
    z: z + (d / 2) * signZ + offZ + extraZ,
  };
}

function getOccupancy(x, y, z, w, d, h, rot) {
  let cells = [];
  const brickPos = computeBrickPos(x, y, z, w, d, rot);

  for (let dy = 0; dy < h; dy++) {
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < d; j++) {
        cells.push({
          x: snap(brickPos.x + i - w / 2),
          y: y + dy,
          z: snap(brickPos.z + j - d / 2),
        });
      }
    }
  }

  return cells;
}

function occupy(x, y, z, w, d, h, rot) {
  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < h; dy++) {
      for (let dz = 0; dz < d; dz++) {
        setOccupied(snap(x + dx - w / 2), y + dy, snap(z + dz - d / 2));
      }
    }
  }
}

function shiftBlock(body) {
  const shiftVal = (Math.random() * 2 - 1) * shift;
  body.position.x += shiftVal;
  body.position.z += shiftVal;
  body.rotation.y += shiftVal;
}
