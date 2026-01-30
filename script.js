const globeContainer = document.getElementById("globe-container");

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* ATTACK ARCS */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.8)
  .arcDashLength(0.55)
  .arcDashGap(4)
  .arcDashAnimateTime(3500)

  /* IMPACT DOT (BRIGHT) */
  .pointsData([])
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(d => d.color)
  .pointRadius(d => d.radius)
  .pointAltitude(0.06)

  /* IMPACT RING */
  .ringsData([])
  .ringLat(d => d.lat)
  .ringLng(d => d.lng)
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.maxRadius)
  .ringAltitude(0.06)
  .ringPropagationSpeed(3.5)
  .ringRepeatPeriod(600)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.3 })
  (globeContainer);

/* ROTATION */
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* ================= ARROWHEADS ================= */
const arrowGroup = new THREE.Group();
globe.scene().add(arrowGroup);

function addArrowHead(attack) {
  const radius = globe.getGlobeRadius();
  const start = globe.getCoords(attack.startLat, attack.startLng, radius);
  const end = globe.getCoords(
    attack.endLat,
    attack.endLng,
    radius + 2.5
  );

  const geometry = new THREE.ConeGeometry(1.4, 5.2, 18);
  const material = new THREE.MeshStandardMaterial({
    color: attack.color,
    emissive: attack.color,
    emissiveIntensity: 1.5
  });

  const arrow = new THREE.Mesh(geometry, material);
  arrow.position.copy(end);
  arrow.lookAt(start);
  arrow.rotateX(Math.PI);

  arrowGroup.add(arrow);

  setTimeout(() => {
    arrowGroup.remove(arrow);
    geometry.dispose();
    material.dispose();
  }, 4200);
}

/* ================= IMPACT EFFECT ================= */
let impactPoints = [];
let impactRings = [];

function addImpactEffect(attack) {
  const point = {
    lat: attack.endLat,
    lng: attack.endLng,
    color: attack.color,
    radius: 0.35
  };

  const ring = {
    lat: attack.endLat,
    lng: attack.endLng,
    color: attack.color,
    maxRadius: 7
  };

  impactPoints.push(point);
  impactRings.push(ring);

  globe.pointsData(impactPoints);
  globe.ringsData(impactRings);

  // Pulse dot
  const pulse = setInterval(() => {
    point.radius += 0.05;
    globe.pointsData(impactPoints);
  }, 60);

  setTimeout(() => {
    clearInterval(pulse);
    impactPoints = impactPoints.filter(p => p !== point);
    impactRings = impactRings.filter(r => r !== ring);
    globe.pointsData(impactPoints);
    globe.ringsData(impactRings);
  }, 1500);
}

/* ================= ATTACK GENERATOR ================= */
function generateAttack() {
  const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  let from = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  let to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

  while (from === to) {
    to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  }

  return {
    startLat: from.lat,
    startLng: from.lng,
    endLat: to.lat,
    endLng: to.lng,
    color: attack.color,
    type: attack.name,
    time: Date.now()
  };
}

/* ================= LIVE LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);

  if (liveAttacks.length > 50) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addArrowHead(attack);
  addImpactEffect(attack);
}, 1000);
