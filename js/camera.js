
const aspect = window.innerWidth / window.innerHeight;
const distance = 20;
let radius = 30;
let theta = Math.PI/4;
let phi = Math.PI/4;

const target = new THREE.Vector3(0, 3, 0);
const keys = {};

function updateStrafe(camera, delta) {
    const speed = 10 * delta;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3()
        .crossVectors(forward, new THREE.Vector3(0, 1, 0))
        .normalize();

    let move = new THREE.Vector3();

    if (keys["KeyW"]) move.add(forward);
    if (keys["KeyS"]) move.addScaledVector(forward, -1);
    if (keys["KeyA"]) move.addScaledVector(right, -1);
    if (keys["KeyD"]) move.add(right);

    if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(speed);

        //applySoftBounds(move);

        camera.position.add(move);
        target.add(move);

        clampTarget(camera);
    }
}

// Camera bounds
const bounds = {
    minX: -GRID_HALF,
    maxX: GRID_HALF,
    minZ: -GRID_HALF,
    maxZ: GRID_HALF,

    minY: -10,
    maxY: 10,
};

function applySoftBounds(move) {
    const margin = 1;

    if (target.x < bounds.minX + margin && move.x < 0) move.x *= 0.3;
    if (target.x > bounds.maxX - margin && move.x > 0) move.x *= 0.3;

    if (target.z < bounds.minZ + margin && move.z < 0) move.z *= 0.3;
    if (target.z > bounds.maxZ - margin && move.z > 0) move.z *= 0.3;
}

function clampTarget(camera) {
    const clamped = target.clone();

    clamped.x = Math.max(bounds.minX, Math.min(bounds.maxX, clamped.x));
    clamped.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, clamped.z));
    clamped.y = Math.max(bounds.minY, Math.min(bounds.maxY, clamped.y));

    const correction = clamped.sub(target);

    target.add(correction);
    camera.position.add(correction);
}

function updateOrbit(camera) {
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(target);

    clampTarget(camera);
}

// Initial setup
function setupCamera()
{
    const camera = new THREE.OrthographicCamera(-distance * aspect, distance * aspect, distance, -distance, 0.1, 1000);

    // camera controls
    let dragging = false;
    let prevX = 0;
    let prevY = 0;

    updateOrbit(camera);

    // Movement keys
    window.addEventListener("keydown", (e) => keys[e.code] = true);
    window.addEventListener("keyup", (e) => keys[e.code] = false);


    // zoom (orthographic)
    window.addEventListener("wheel", (e) => {

        if (e.target.closest("#brickButtons")) return;

        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        camera.zoom *= factor;
        camera.zoom = Math.max(0.5, Math.min(5, camera.zoom));
        camera.updateProjectionMatrix();
    });

    window.addEventListener("mousedown", (e) => {
        if (e.button === 2) {
            dragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        }
    });

    window.addEventListener("mouseup", () => (dragging = false));
    window.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;

        theta += dx * 0.005;
        phi -= dy * 0.005;

        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

        updateOrbit(camera);
    });
    
    window.addEventListener("resize", () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.left = -distance * aspect;
        camera.right = distance * aspect;
        camera.top = distance;
        camera.bottom = -distance;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return camera;
}

// Used for orbiting
let orbitEnabled = false;
function toggleIdleOrbit() {
    orbitEnabled = !orbitEnabled;
    return orbitEnabled;
}
function updateIdleOrbit(delta) {

    if (orbitEnabled) {
        const orbitSpeed = 0.2; // radians per second (tweak this)
        theta += orbitSpeed * delta;

        updateOrbit(camera);
    }
}