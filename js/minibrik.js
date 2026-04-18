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



function createBrick(w,d,color,transparent=false,type="box",hollowStud=false){
  const group=new THREE.Group();

  const mat=new THREE.MeshStandardMaterial({
    color, 
    transparent, 
    opacity:transparent ? 0.5 : 1, 
    roughness: 0.8,
  });

  const studGeoToUse = hollowStud ? hollowStudGeo : studGeo;
  let body;

  if(type === "box"){
      body=new THREE.Mesh(new THREE.BoxGeometry(w-gap,1-gap*0.5,d-gap),mat);

    for(let i=0;i<w;i++) for(let j=0;j<d;j++){
      const stud=new THREE.Mesh(studGeoToUse,mat);
      stud.position.set(i-w/2+0.5,0.6,j-d/2+0.5);
      stud.castShadow = true;
      stud.receiveShadow = true;
      group.add(stud);
    }
  }
  else if(type === "tile"){
    body=new THREE.Mesh(new THREE.BoxGeometry(w - gap,0.2,d - gap),mat);
    body.position.y = -0.2 - studH;
  }
  else if(type === "cylinder"){
    const rad = w == 1 ? 0.45 : w/2;
    body=new THREE.Mesh(new THREE.CylinderGeometry(rad - gap, rad - gap, 1, 24),mat);
    for(let i=0;i<w;i++)
    {
      for(let j=0;j<d;j++){
        const stud=new THREE.Mesh(studGeoToUse,mat);
        stud.position.set(i-w/2+0.5,0.6,j-d/2+0.5);
        stud.castShadow = true;
        stud.receiveShadow = true;
        group.add(stud);
      }
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
  else if(type === "flag"){
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05,0.05,1.2,12),
      new THREE.MeshStandardMaterial({color:0xdddddd})
    );

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1,0.6),
      mat
    );

    flag.position.set(0.5,0.3,0);

    group.add(pole);
    group.add(flag);

    body = pole;
  }
  else if(type === "flame"){
    const flameMat = new THREE.MeshStandardMaterial({
      color:0xff7a18,
      transparent:true,
      opacity:0.7
    });

    body = new THREE.Mesh(
      new THREE.ConeGeometry(0.4,1.2,12),
      flameMat
    );

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

function updatePreview(){
  if(preview) scene.remove(preview);

  const b = BRICKS[currentBrick];
  const obj = createBrick(b.w,b.d,currentColor,true,b.type,b.hollowStud);
  preview = obj.group;
  preview.rotation.y = rotation*Math.PI/180;
  scene.add(preview);
}

updatePreview();

function updatePreviewColor(valid){
  preview.traverse(o=>{
    if(o.material) o.material.color.set(valid?currentColor:0xff0000);
  });
}

function snap(p){
  return Math.floor(p + gridSize/2) - gridSize/2;
}

function updatePreviewPos()
{
  raycaster.setFromCamera(mouse,camera);
  const hits=raycaster.intersectObjects(colliders);

  if(!hits.length) return;

  const p=hits[0].point;
  const [w,d]=getFootprint(currentBrick, rotation);

  const x=snap(p.x);
  const y=snap(p.y);
  const z=snap(p.z);

  const occupancy = getOccupancy(x,y,z,w,d,rotation);
  const res = computePlacement(x, y, z, w, d);
  const realPos = computeBrickPos(x,res.y,z,w,d,rotation);

  previewState={x: x, z: z, y:res.y,valid:res.valid };
  
  preview.position.set(
    realPos.x,
    realPos.y,
    realPos.z,
  );
  updatePreviewColor(res.valid);
}

function placeBlock(brickId, x, y, z, rot, color)
{
    const [w,d]=getFootprint(brickId, rot);

    const blockPos = computeBrickPos(x, y, z, w, d, rot);

    const def=BRICKS[brickId];
    const obj=createBrick(def.w,def.d,color,false,def.type,def.hollowStud);
    const group=obj.group;

    group.rotation.y = rot*Math.PI/180;

    group.position.set(blockPos.x, y+0.5, blockPos.z);

    scene.add(group);

    //console.log("oth: ", w, d, rot)
    //console.log("coords: ", x,y,z)
    //console.log(blockPos)

    colliders.push(obj.body);
    occupy(blockPos.x, y, blockPos.z, w, d);
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