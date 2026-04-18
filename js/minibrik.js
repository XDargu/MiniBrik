let buildQueue = [];
let isBuilding = false;
let colliders = [];

let currentBrick = 0;
let currentColor = COLORS[0];
let rotation = 0;

const renderer = new THREE.WebGLRenderer({ antialias: true });
let scene = buildEmptyScene(renderer);
let camera = setupCamera();

let base = addBase();
scene.add(base);
colliders.push(base);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const materialsByColor = new Map(COLORS.map((color) => {
    return [color, new THREE.MeshStandardMaterial({
        color, 
        roughness: 0.8
    })];
}));

const materialsByColorDoubleSided = COLORS.map((color) => {
    return new THREE.MeshStandardMaterial({
        color, 
        roughness: 0.8,
        side: THREE.FrontSide
        
    });
})
materialsByColorDoubleSided.shadowSide = THREE.FrontSide

function createBrick(w,d,h,color,transparent=false,type="box",hollowStud=false){
  const group=new THREE.Group();

  //const mat = materialsByColor[color];
  const mat=new THREE.MeshStandardMaterial({
    color, 
    transparent, 
    opacity:transparent ? 0.5 : 1, 
    roughness: 0.8,
  });

  const mat2s=new THREE.MeshStandardMaterial({
    color, 
    transparent, 
    opacity:transparent ? 0.5 : 1, 
    roughness: 0.8,
    side: THREE.DoubleSide
  });

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
        body = new THREE.Mesh(new THREE.CylinderGeometry(rad - gap, rad - gap, 0.8, 24),mat);
    else
        body = new THREE.Mesh(new THREE.CylinderGeometry(rad - gap, rad - gap, 1, 24),mat);

    for(let i=0;i<w;i++)
    {
      for(let j=0;j<d;j++)
      {
        const stud=new THREE.Mesh(studGeoToUse,mat);
        stud.position.set(i-w/2+0.5,0.6,j-d/2+0.5);
        stud.castShadow = true;
        stud.receiveShadow = true;
        group.add(stud);
      }
    }

    if (is1x1)
    {
        body.position.y += 0.1;

        const studBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16), mat);
        studBase.position.set(0, -0.4, 0);
        studBase.castShadow = true;
        studBase.receiveShadow = true;
        group.add(studBase);
    }
  }
  else if(type === "slope"){
    body=new THREE.Mesh(new THREE.BoxGeometry(w,1,d),mat);
    body.rotation.x = -0.5;
    body.position.y = 0.5;
  }
  else if(type === "slope_3040"){
    const geo = new THREE.BoxGeometry(w,1,d,1,1,1);
    geo.translate(0,0.5,0);
    geo.vertices?.forEach?.(() => {}); // placeholder (ignored in r160)

    body = new THREE.Mesh(geo, mat);
    body.rotation.x = -Math.PI / 4;
    body.position.y = 0.5;
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
  if(preview) scene.remove(preview);

  const b = BRICKS[currentBrick];
  const obj = createBrick(b.w,b.d,b.h,currentColor,true,b.type,b.hollowStud);
  preview = obj.group;
  preview.rotation.y = rotation*Math.PI/180;
  scene.add(preview);
}

updatePreview();

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

  if(!hits.length) return;

  const p=hits[0].point;
  const [w,d]=getFootprint(currentBrick, rotation);

  const x=snap(p.x);
  const y=snap(p.y);
  const z=snap(p.z);

  const def = BRICKS[currentBrick];

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
    const obj=createBrick(def.w,def.d,def.h,color,false,def.type,def.hollowStud);
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

function renderScene(){
  requestAnimationFrame(renderScene);
  renderer.render(scene,camera);
}
renderScene();

initLoad();

renderer.getContext().canvas.oncontextmenu = () => { return false }