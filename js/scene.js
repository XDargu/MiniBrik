const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
const intensity = 2;

function buildEmptyScene(preset)
{
    const scene = new THREE.Scene();
    //scene.background = new THREE.Color(preset.background);

    const light = new THREE.HemisphereLight(preset.hemi.sky, preset.hemi.ground, preset.hemi.intensity);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.shadow.camera.left = -12;
    dirLight.shadow.camera.right = 12;
    dirLight.shadow.camera.bottom = -12;
    dirLight.shadow.camera.top = 12;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.camera.updateProjectionMatrix();
    dirLight.position.set(-10,20,10);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.000038;
    dirLight.shadow.normalBias = 0.00005;
    scene.add(dirLight);

    return scene;
}

let hemi, dir;
let transition = null;

function initLighting(scene) {
  hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
  dir = new THREE.DirectionalLight(0xffffff, 1);

  scene.add(hemi);
  scene.add(dir);
}

function transitionToPreset(scene, renderer, preset, duration = 0.6) {

  transition = {
    time: 0,
    duration,

    from: {
      background: scene.background
        ? scene.background.clone()
        : new THREE.Color(0x000000),

      hemiSky: hemi.color.clone(),
      hemiGround: hemi.groundColor.clone(),
      hemiIntensity: hemi.intensity,

      dirColor: dir.color.clone(),
      dirIntensity: dir.intensity,
      dirPos: dir.position.clone(),

      exposure: renderer.toneMappingExposure,
    },

    to: {
      background: new THREE.Color(preset.background),

      hemiSky: new THREE.Color(preset.hemi.sky),
      hemiGround: new THREE.Color(preset.hemi.ground),
      hemiIntensity: preset.hemi.intensity,

      dirColor: new THREE.Color(preset.dir.color),
      dirIntensity: preset.dir.intensity,
      dirPos: new THREE.Vector3(...preset.dir.position),

      exposure: preset.renderer.exposure,
    }
  };

  // Instant (non-blended) settings
  renderer.toneMapping = preset.renderer.toneMapping;
  renderer.shadowMap.enabled = !!preset.renderer.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Shadows (apply immediately, not blended)
  if (preset.dir.shadow?.enabled) {
    dir.castShadow = true;

    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.bias = -0.000038;
    dir.shadow.normalBias = 0.00005;
    dir.shadow.radius = 100;

    const d = 20;
    dir.shadow.camera.left = -d;
    dir.shadow.camera.right = d;
    dir.shadow.camera.top = d;
    dir.shadow.camera.bottom = -d;
    dir.shadow.camera.near = 2;
    dir.shadow.camera.far = 60;
  } else {
    dir.castShadow = false;
  }
}

function updateLightingTransition(scene, renderer, dt) {
  if (!transition) return;

  transition.time += dt;

  let t = transition.time / transition.duration;
  if (t >= 1) t = 1;

  // smoothstep easing
  t = t * t * (3 - 2 * t);

  // Background
  const bg = new THREE.Color();
  bg.copy(transition.from.background).lerp(transition.to.background, t);
  scene.background = bg;

  // Ambient light
  hemi.color.copy(transition.from.hemiSky).lerp(transition.to.hemiSky, t);
  hemi.groundColor.copy(transition.from.hemiGround).lerp(transition.to.hemiGround, t);

  hemi.intensity = THREE.MathUtils.lerp(
    transition.from.hemiIntensity,
    transition.to.hemiIntensity,
    t
  );

  // Dir light
  dir.color.copy(transition.from.dirColor).lerp(transition.to.dirColor, t);

  dir.intensity = THREE.MathUtils.lerp(
    transition.from.dirIntensity,
    transition.to.dirIntensity,
    t
  );

  dir.position.lerpVectors(
    transition.from.dirPos,
    transition.to.dirPos,
    t
  );

  // keep light at consistent distance
  dir.position.normalize().multiplyScalar(10);

  // Light exposure
  renderer.toneMappingExposure = THREE.MathUtils.lerp(
    transition.from.exposure,
    transition.to.exposure,
    t
  );

  if (t === 1) {
    transition = null;
  }
}