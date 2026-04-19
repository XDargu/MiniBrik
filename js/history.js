// Undo / Redo

let blockHistory = [];
const redoStack = [];

function pushHistory(entry){
  blockHistory.push(entry);
  redoStack.length = 0;
}

function undo(){
  const h = blockHistory.pop();
  if(!h) return false;

  scene.remove(h.group);
  redoStack.push(h);

  // Remove collider
  const colIdx = colliders.indexOf(h.collider);
  colliders.splice(colIdx, 1);

  rebuild();
  updateShareURL();
  return true;
}

function redo(){
  const h = redoStack.pop();
  if(!h) return false;

  scene.add(h.group);
  blockHistory.push(h);
  colliders.push(h.collider);
  const blockPos = computeBrickPos(h.x, h.y, h.z, h.w, h.d, h.r);
  const def = BRICKS[h.id];
  occupy(blockPos.x,h.y,blockPos.z,h.w,h.d,def.h);
  updateShareURL();
  return true;
}

function rebuild(){
  occupied.clear();
  for(const h of blockHistory){ 
    const def = BRICKS[h.id];
    const blockPos = computeBrickPos(h.x, h.y, h.z, h.w, h.d, h.r);
    occupy(blockPos.x,h.y,blockPos.z,h.w,h.d, def.h);
  }
}

function clearHistory()
{
    blockHistory.length = 0;
    redoStack.length = 0;
}


// Load and Store History
function updateShareURL() {
  const encoded = encodeState(globalSettings, blockHistory);
  const url = `${location.origin}${location.pathname}#${encoded}`;
  history.replaceState(null, "", url);
}

function initLoad() {
  const hash = location.hash.slice(1);
  if (!hash) return;

  const state = decodeState(hash);
  if (state.settings)
  {
    globalSettings = state.settings;
    transitionToPreset(scene, renderer, LIGHT_PRESETS[globalSettings.lightPreset], 0.1);
  }
  loadFromHistory(state.bricks);
}


// Animation
let totalBuildCount = 0;
let builtCount = 0;

function loadFromHistory(deserializedHistory) {
  if (!deserializedHistory) return;

  // reset everything
  clearHistory();

  // clear scene (keep base)
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const obj = scene.children[i];
    if (obj === preview) continue;
    if (obj === previewTarget) continue;
    if (obj === base) continue;
    if (obj.isLight) continue;
    scene.remove(obj);
  }

  colliders.length = 1;
  occupied.clear();

  // build queue instead of instant placement
  buildQueue = [...deserializedHistory];
  totalBuildCount = buildQueue.length;
  builtCount = 0;
  isBuilding = true;

  buildNextBrick();
}


function getSpawnDelay(progress) {
  const minDelay = 30;   // fastest (end)
  const maxDelay = 200;  // slow start

  // ease-in (accelerating spawn rate)
  const t = progress;
  const eased = t * t * t; // cubic

  return maxDelay - (maxDelay - minDelay) * eased;
}

function buildNextBrick() {
  if (!buildQueue.length) {
    isBuilding = false;
    return;
  }

  const h = buildQueue.shift();
  const def = BRICKS[h.id];
  if (!def) {
    buildNextBrick();
    return;
  }

  let hist = placeBlock(h.id, h.x, h.y, h.z, h.r, h.c);
  let group = hist.group;

  const targetY = group.position.y;
  group.position.set(
    group.position.x,
    group.position.y  + 5 + Math.random() * 2,
    group.position.z
  );

  // animation
  let velocity = 0;
  const gravity = -0.05;

  function fall() {
    velocity += gravity;
    group.position.y += velocity;

    if (group.position.y <= targetY) {
      group.position.y = targetY;

      // small "settle" effect
      group.position.y += 0.1;
      setTimeout(() => {
        group.position.y = targetY;
        buildNextBrick();
      }, 50);

      return;
    }

    requestAnimationFrame(fall);
  }

  fall();

  builtCount++;

  const progress = builtCount / totalBuildCount;
  const delay = getSpawnDelay(progress);

  setTimeout(buildNextBrick, delay);
}