const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Earth
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthTexture = new THREE.TextureLoader().load(
  './assets/earth_daymap.jpg'
);
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Light
const light = new THREE.PointLight(0xffffff, 1.5);
light.position.set(5, 3, 5);
scene.add(light);

// Lat/Lon to 3D
function latLongToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Attack Arc
function createAttackArc(start, end, color) {
  const startVec = latLongToVector3(...start);
  const endVec = latLongToVector3(...end);

  const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(1.4);

  const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
  const points = curve.getPoints(50);

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9
  });

  scene.add(new THREE.Line(geometry, material));
}

// Load attacks
fetch('./data/attacks.json')
  .then(res => res.json())
  .then(attacks => {
    attacks.forEach(a => {
      createAttackArc(a.sourceCoords, a.destCoords, a.color);
    });
  });

// Animate
function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.0008;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
