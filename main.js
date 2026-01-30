const scene = new THREE.Scene();

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.z = 3;

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

/* STARFIELD BACKGROUND */
const starsGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const starVertices = [];

for (let i = 0; i < starCount; i++) {
  starVertices.push(
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000
  );
}
starsGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starVertices, 3)
);
const starsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.7
});
scene.add(new THREE.Points(starsGeometry, starsMaterial));

/* EARTH */
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthTexture = new THREE.TextureLoader().load('./assets/earth_daymap.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({
  map: earthTexture
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

/* ATMOSPHERE GLOW */
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.03, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.15
  })
);
scene.add(atmosphere);

/* LIGHTING */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

scene.add(new THREE.AmbientLight(0x222222));

/* LAT/LON → VECTOR */
function latLongToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ATTACK ARC WITH GLOW + MOVING DOT */
function createAttackArc(start, end, color) {
  const startVec = latLongToVector3(...start);
  const endVec = latLongToVector3(...end);

  const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(1.4);

  const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  /* GLOW LINE */
  const glow = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3
    })
  );
  glow.scale.set(1.01, 1.01, 1.01);

  /* MAIN LINE */
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 1
    })
  );

  scene.add(glow);
  scene.add(line);

  /* MOVING ATTACK DOT */
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 8, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  scene.add(dot);

  let t = 0;
  function animateDot() {
    t += 0.002;
    if (t > 1) t = 0;
    dot.position.copy(curve.getPointAt(t));
    requestAnimationFrame(animateDot);
  }
  animateDot();
}

/* LOAD ATTACK DATA */
fetch('./data/attacks.json')
  .then(res => res.json())
  .then(attacks => {
    attacks.forEach(a => {
      createAttackArc(a.sourceCoords, a.destCoords, a.color);
    });
  });

/* ANIMATION LOOP */
function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.0008;
  atmosphere.rotation.y += 0.0008;
  renderer.render(scene, camera);
}
animate();

/* RESIZE */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

