const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
const intensity = 2;

function buildEmptyScene()
{
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x196c89);

    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
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