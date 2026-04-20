let buildQueue = [];
let isBuilding = false;
let colliders = [];

let currentBrick = 0;
let currentColor = COLORS[0];
let rotation = 0;
let blockOffset = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true
renderer.debug.checkShaderErrors = false;
document.body.appendChild(renderer.domElement);

let scene = new THREE.Scene();
initLighting(scene);
transitionToPreset(scene, renderer, LIGHT_PRESETS[globalSettings.lightPreset], 0.01);
let camera = setupCamera();
let audio = setupAudio(camera);

let base = addBase();
scene.add(base);
colliders.push(base);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const materialsByColor = new Map(COLORS.map((color) => {
    return [color, new THREE.MeshStandardMaterial({
        color, 
        roughness: 0.8,
        emissive: (color == 0xffc94a || color == 0xe74c3d) ? new THREE.Color(color): null,
        emissiveIntensity: color == 0xffc94a ? 3 : 2,
    })];
}));

const materialsByColorDoubleSided = new Map(COLORS.map((color) => {
    return [color, new THREE.MeshStandardMaterial({
        color, 
        roughness: 0.8,
        side: THREE.DoubleSide
    })];
}));

function createBrick(w,d,h,rot,color,type="box",hollowStud=false){
  const group=new THREE.Group();

  const mat = materialsByColor.get(color);
  const mat2s = materialsByColorDoubleSided.get(color);

  const studGeoToUse = hollowStud ? hollowStudGeo : studGeo;
  const is1x1 = w == 1 && d == 1;
  const hNorm = h / brickH;
  let body;

  if(type === "box"){
      const center = hNorm*0.5;
      const diff = center - 0.5;
      
      body=new THREE.Mesh(new THREE.BoxGeometry(w-gap, hNorm-gap*0.5, d-gap), mat);
      body.position.y = diff;

    for(let i=0;i<w;i++) {
      for(let j=0;j<d;j++) {
        const stud = new THREE.Mesh(studGeoToUse,mat);
        stud.position.set(i-w/2+0.5, hNorm - 0.4, j-d/2+0.5);
        stud.castShadow = true;
        stud.receiveShadow = true;
        group.add(stud);
      }
    }
  }
  else if(type === "tile"){
    body=new THREE.Mesh(new THREE.BoxGeometry(w - gap,0.2,d - gap),mat);
    body.position.y = -0.2 - studH;
  }
  else if(type === "cylinder"){
    const rad = w == 1 ? 0.45 : w/2;

    if (is1x1)
        body = new THREE.Mesh(new THREE.CylinderGeometry(rad - gap, rad - gap, hNorm-gap-0.2, 16),mat);
    else
        body = new THREE.Mesh(new THREE.CylinderGeometry(rad - gap, rad - gap, hNorm-gap, 16),mat);

    for(let i=0;i<w;i++)
    {
      for(let j=0;j<d;j++)
      {
        const stud=new THREE.Mesh(studGeoToUse,mat);
        stud.position.set(i-w/2+0.5,hNorm-0.4-gap,j-d/2+0.5);
        stud.castShadow = true;
        stud.receiveShadow = true;
        group.add(stud);
      }
    }

    if (is1x1)
    {
        const h = hNorm-gap-0.2;
        body.position.y += h*0.5 - 0.3;

        const studBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16), mat);
        studBase.position.set(0, -0.4, 0);
        studBase.castShadow = true;
        studBase.receiveShadow = true;
        group.add(studBase);
    }
  }
  else if(type === "bar"){
    body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, hNorm, 20),
      mat
    );
    body.position.y += hNorm/2 - 0.5;

    const studBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.4, 16), mat);
    studBase.position.set(0, -0.3, 0);
    studBase.castShadow = true;
    studBase.receiveShadow = true;
    group.add(studBase);

    const studBase2 = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 16), mat);
    studBase2.position.set(0, -0.0, 0);
    studBase2.castShadow = true;
    studBase2.receiveShadow = true;
    group.add(studBase2);

  }
  else if(type === "cone"){
    body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.45,0.8,20),
      mat
    );
    body.position.y += 0.1;
    

    const stud = new THREE.Mesh(studGeoToUse,mat);
    stud.position.set(0,0.6,0);
    stud.castShadow = true;
    stud.receiveShadow = true;
    group.add(stud);

    const studBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16), mat);
    studBase.position.set(0, -0.4, 0);
    studBase.castShadow = true;
    studBase.receiveShadow = true;
    group.add(studBase);
  }
  else if(type === "dish"){
    body = new THREE.Mesh(
      dishGeo,
      mat2s
    );

    const stud = new THREE.Mesh(studGeoToUse,mat);
    stud.position.set(0,0.2,0);
    stud.castShadow = true;
    stud.receiveShadow = true;
    group.add(stud);

    const studBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16), mat);
    studBase.position.set(0, -0.4, 0);
    studBase.castShadow = true;
    studBase.receiveShadow = true;
    group.add(studBase);
  }
  else if(type === "arch"){
      const center = hNorm*0.5;
      const diff = center - 0.5;
      
      body=new THREE.Mesh(createLegoArchGeometry({ width: d-gap, height: hNorm-gap, holeWidth: d - 2 }), mat);
      body.position.y = -0.5;

    for(let i=0;i<w;i++) {
      for(let j=0;j<d;j++) {
        const stud = new THREE.Mesh(studGeoToUse,mat);
        stud.position.set(i-w/2+0.5, hNorm - 0.4, j-d/2+0.5);
        stud.castShadow = true;
        stud.receiveShadow = true;
        group.add(stud);
      }
    }
  }
  else if(type === "slope"){
      const center = hNorm*0.5;
      const diff = center - 0.5;
      
      body=new THREE.Mesh(createLegoSlopeGeometry({ width: d-gap, height: hNorm-gap, depth: w-gap }), mat);
      body.position.y = -0.5;

    for(let i=0;i<w;i++) {
      for(let j=0;j<1;j++) {
        const stud = new THREE.Mesh(studGeoToUse,mat);
        stud.position.set(i-w/2+0.5, hNorm - 0.4, j-d/2+0.5);
        stud.castShadow = true;
        stud.receiveShadow = true;
        group.add(stud);
      }
    }
  }
  else if(type === "door"){
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w,1.8,d),
      mat
    );

    const opening = new THREE.Mesh(
      new THREE.BoxGeometry(w*0.7,1.5,d*1.1),
      new THREE.MeshStandardMaterial({color:0x111111})
    );

    opening.position.y = -0.2;

    group.add(frame);
    group.add(opening);

    body = frame;
  }
  else if(type === "window"){
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(w,1.5,d),
      mat
    );

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(w*0.8,1),
      new THREE.MeshStandardMaterial({
        color:0xaad4ff,
        transparent:true,
        opacity:0.4
      })
    );

    glass.position.z = d/2 + 0.01;

    group.add(frame);
    group.add(glass);

    body = frame;
  }


  body.castShadow = true;
  body.receiveShadow = true;

  group.add(body);
  shiftBlock(body);

  // Special cases for rotation
  /*if (type=="dish" && (rot == 90 || rot == 270))
  {
    group.rotation.x = Math.PI;
  }*/

  if (color == 0xffc94a || color == 0xe74c3d)
  {
    const light = new THREE.PointLight( color, color == 0xe74c3d ? 25 : 50, 10 );
    //light.castShadow = true;
    light.shadow.bias = -0.000038;
    light.shadow.normalBias = 0.00005;
    light.shadow.mapSize.height = 256;
    light.shadow.mapSize.width = 256;
    group.add( light );
  }

  return {group,body};
}

// --------------------
// PREVIEW
// --------------------
let preview;
let previewState={x:0,z:0,y:0,valid:false};

const sphere = new THREE.SphereGeometry( 0.3, 16, 16 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const previewTarget = new THREE.Mesh( sphere, material );
scene.add(previewTarget)

function updatePreview(){
  let prevPos = null;
  if(preview)
  {
    prevPos = preview.position.clone();
    disposePreviewMaterial();
    scene.remove(preview);
  }

  const b = BRICKS[currentBrick];
  const obj = createBrick(b.w,b.d,b.h,rotation,currentColor,b.type,b.hollowStud);
  
  preview = obj.group;
  preview.rotation.y = rotation*Math.PI/180;
  preview.position.set(prevPos?.x || -1000, prevPos?.y || -1000, prevPos?.z || -1000);

  scene.add(preview);

  clonePreviewMaterial();
}

updatePreview();

function clonePreviewMaterial(){
  preview.traverse(o=>{
    if(o.material)
    {
        o.material = o.material.clone();
        o.material.transparent = true;
        o.material.opacity = 0.5;
    }
  });
}

function disposePreviewMaterial(){
  preview.traverse(o=>{
    if(o.material)
        o.material = o.material.dispose();
  });
}

function updatePreviewColor(valid){
  preview.traverse(o=>{
    if(o.material)
        o.material.color.set(valid?currentColor:0xff0000);
  });
}

function snap(p){
  return Math.floor(p + gridSize/2) - gridSize/2;
}

function updatePreviewPos()
{
  raycaster.setFromCamera(mouse,camera);
  const hits = raycaster.intersectObjects(colliders);
  
  previewState={x: -1000, z: -1000, y:-1000,valid:false };
  preview.position.set(-1000,-1000,-1000);
  previewTarget.position.set(-1000,-1000,-1000);

  if(!hits.length) return;

  const p=hits[0].point;
  const [w,d]=getFootprint(currentBrick, rotation);

  const def = BRICKS[currentBrick];

  // Offset, to select which block we use as pivot
  blockOffset = blockOffset % (def.w * def.d);
  const offsetX = blockOffset % def.w;
  const offsetZ = Math.floor(blockOffset / def.w);

  const rotatedOffsetX = -Math.cos(rotation * Math.PI / 180) * offsetX  + Math.sin(rotation * Math.PI / 180) * offsetZ;
  const rotatedOffsetZ = -Math.cos(rotation * Math.PI / 180) * offsetZ  - Math.sin(rotation * Math.PI / 180) * offsetX;

  const x=snap(p.x + rotatedOffsetX);
  const y=snap(p.y * 3);
  const z=snap(p.z + rotatedOffsetZ);

  const res = computePlacement(x, y, z, w, d, def.h, rotation);
  const realPos = computeBrickPos(x,res.y,z,w,d,rotation);

  previewState={x: x, z: z, y:res.y,valid:res.valid };
  
  preview.position.set(
    realPos.x,
    realPos.y,
    realPos.z,
  );

  previewTarget.position.set(
    p.x,
    p.y,
    p.z,
  )
  updatePreviewColor(res.valid);
}

function placeBlock(brickId, x, y, z, rot, color)
{
    const [w,d]=getFootprint(brickId, rot);

    const blockPos = computeBrickPos(x, y, z, w, d, rot);

    const def=BRICKS[brickId];
    const obj=createBrick(def.w,def.d,def.h,rot,color,def.type,def.hollowStud);
    const group=obj.group;

    group.rotation.y = rot*Math.PI/180;

    group.position.set(blockPos.x, blockPos.y, blockPos.z);

    scene.add(group);

    //console.log("oth: ", w, d, rot)
    //console.log("coords: ", x,y,z)
    //console.log(blockPos)

    colliders.push(obj.body);
    occupy(blockPos.x, y, blockPos.z, w, d, def.h);
    const h = {
        id: brickId,
        c: color,
        x: x,
        y,
        z: z,
        w: w,
        d: d,
        r: rot,
        group: group,
        collider: obj.body,
    };
    pushHistory(h);

    return h;
}

let lastTime = performance.now();

function renderScene(){

  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  updateStrafe(camera, delta);
  updateLightingTransition(scene, renderer, delta);
  updateIdleOrbit(delta);

  requestAnimationFrame(renderScene);
  renderer.render(scene,camera);
}
renderScene();

initLoad();
initUI();

renderer.getContext().canvas.oncontextmenu = () => { return false }
