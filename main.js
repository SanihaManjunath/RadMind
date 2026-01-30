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

/* STARFIELD */
const starsGeometry = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 10000; i++) {
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
scene.add(
  new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })
  )
);

/* EARTH */
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 64, 64),
  new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('./assets/earth_daymap.jpg')
  })
);
scene.add(earth);

/* ATMOSPHERE */
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
scene.add(new THREE.DirectionalLight(0xffffff, 1.3).position.set(5, 3, 5));
scene.add(new THREE.AmbientLight(0x222222));

/* UTILS */
function latLongToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createCyberArc(start, end, color) {
  const startVec = latLongToVector3(...start);
  const endVec = latLongToVector3(...end);

  const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(1.5);

  const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  // ===== GLOW LAYER =====
  const glowLine = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35
    })
  );
  glowLine.scale.set(1.02, 1.02, 1.02);
  scene.add(glowLine);

  // ===== MAIN ARC =====
  const mainLine = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 1
    })
  );
  scene.add(mainLine);

  // ===== ARROW HEAD =====
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.12, 12),
    new THREE.MeshBasicMaterial({ color })
  );
  scene.add(arrow);

  let t = 0;
  function animateArrow() {
    t += 0.006;
    if (t > 1) {
      scene.remove(mainLine);
      scene.remove(glowLine);
      scene.remove(arrow);
      return;
    }

    const current = curve.getPointAt(t);
    const next = curve.getPointAt(Math.min(t + 0.01, 1));

    arrow.position.copy(current);
    arrow.lookAt(next);

    requestAnimationFrame(animateArrow);
  }
  animateArrow();
}

/* ATTACK TYPES */
const ATTACKS = [
  { name: "DDoS", color: "#ff1744" },
  { name: "Phishing", color: "#ffca28" },
  { name: "Malware", color: "#ab47bc" },
  { name: "Brute Force", color: "#29b6f6" },
  { name: "Ransomware", color: "#66bb6a" }
];

/* CREATE LIVE ATTACK ARC */
function spawnAttack() {
  const attack = ATTACKS[Math.floor(Math.random() * ATTACKS.length)];

  const start = [
    Math.random() * 180 - 90,
    Math.random() * 360 - 180
  ];
  const end = [
    Math.random() * 180 - 90,
    Math.random() * 360 - 180
  ];

  const startVec = latLongToVector3(...start);
  const endVec = latLongToVector3(...end);

  const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(1.4);

  const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));

  const glow = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: attack.color,
      transparent: true,
      opacity: 0.3
    })
  );
  glow.scale.set(1.01, 1.01, 1.01);

  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: attack.color,
      transparent: true,
      opacity: 1
    })
  );

  scene.add(glow);
  scene.add(line);

  /* MOVING DOT */
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 8, 8),
    new THREE.MeshBasicMaterial({ color: attack.color })
  );
  scene.add(dot);

  let t = 0;
  const animateDot = () => {
    t += 0.01;
    if (t > 1) {
      scene.remove(dot);
      scene.remove(line);
      scene.remove(glow);
      return;
    }
    dot.position.copy(curve.getPointAt(t));
    requestAnimationFrame(animateDot);
  };
  animateDot();

  /* UPDATE UI */
  window.dispatchEvent(new CustomEvent("newAttack", {
    detail: attack.name
  }));
}

/* SPAWN ATTACKS CONTINUOUSLY */
setInterval(spawnAttack, 800);

/* ANIMATE */
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
