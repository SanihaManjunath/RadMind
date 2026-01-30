const globeContainer = document.getElementById("globe-container");

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* ATTACK ARCS */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.4)
  .arcAltitude(0.25)          // ⬅ LIFT ARCS ABOVE EARTH
  .arcDashLength(0.55)
  .arcDashGap(4)
  .arcDashAnimateTime(3200)

  /* IMPACT DOT */
  .pointsData([])
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)
  .pointColor(d => d.color)
  .pointRadius(d => d.radius)
  .pointAltitude(0.08)

  /* IMPACT RING */
  .ringsData([])
  .ringLat(d => d.lat)
  .ringLng(d => d.lng)
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.maxRadius)
  .ringAltitude(0.08)
  .ringPropagationSpeed(3.8)
  .ringRepeatPeriod(600)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.25 })
  (globeContainer);

/* ROTATION */
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.32;

/* ================= FORCE VISIBILITY ================= */
globe.scene().traverse(obj => {
  if (obj.material) {
    obj.material.depthTest = false; // ⬅ ALWAYS ON TOP
  }
});

/* ================= ARROWHEADS ================= */
const arrowGroup = new THREE.Group();
globe.scene().add(arrowGroup);

function addArrowHead(attack) {
  const radius = globe.getGlobeRadius();
  const start = globe.getCoords(attack.startLat, attack.startLng, radius);
  const end = globe.getCoords(
    attack.endLat,
    attack.endLng,
    radius + 3.2   // ⬅ FLOAT HIGHER
  );

  const geometry = new THREE.ConeGeometry(1.6, 6, 18);
  const material = new THREE.MeshStandardMaterial({
    color: attack.color,
    emissive: attack.color,
    emissiveIntensity: 1.6
  });

  const arrow = new THREE.Mesh(geometry, material);
  arrow.position.copy(end);
  arrow.lookAt(start);
  arrow.rotateX(Math.PI);

  arrow.renderOrder = 10; // ⬅ PRIORITY RENDER
  arrowGroup.add(arrow);

  setTimeout(() => {
    arrowGroup.remove(arrow);
    geometry.dispose();
    material.dispose();
  }, 4000);
}

/* ================= IMPACT EFFECT ================= */
let impactPoints = [];
let impactRings = [];

function addImpactEffect(attack) {
  const point = {
    lat: attack.endLat,
    lng: attack.endLng,
    color: attack.color,
    radius: 0.4
  };

  const ring = {
    lat: attack.endLat,
    lng: attack.endLng,
    color: attack.color,
    maxRadius: 8
  };

  impactPoints.push(point);
  impactRings.push(ring);

  globe.pointsData(impactPoints);
  globe.ringsData(impactRings);

  setTimeout(() => {
    impactPoints = impactPoints.filter(p => p !== point);
    impactRings = impactRings.filter(r => r !== ring);
    globe.pointsData(impactPoints);
    globe.ringsData(impactRings);
  }, 1400);
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

  // ⬅ HARD CAP (SOC RULE)
  if (liveAttacks.length > 18) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addArrowHead(attack);
  addImpactEffect(attack);
}, 1000);
