const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

const soundPools = {
  place: [],
  remove: []
};

function loadPool(paths, targetPool) {
  paths.forEach(path => {
    audioLoader.load(path, (buffer) => {
      targetPool.push(buffer);
    });
  });
}

function setupAudio(camera)
{
    camera.add(listener);

    loadPool([
        "audio/click1.wav",
        "audio/click2.wav",
        "audio/click3.wav",
    ], soundPools.place);
    
    loadPool([
        "audio/switch1.wav",
    ], soundPools.remove);
}

function playFromPool(pool) {
    if (pool.length === 0) return;

    const buffer = pool[Math.floor(Math.random() * pool.length)];

    const sound = new THREE.Audio(listener);
    sound.setBuffer(buffer);

    sound.setPlaybackRate(0.8 + Math.random() * 0.2);
    sound.setVolume(0.7 + Math.random() * 0.3);

    sound.play();
}