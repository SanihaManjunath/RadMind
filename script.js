const globeContainer = document.getElementById("globe-container");

/* Arrow texture (triangle) */
const arrowTexture = new THREE.TextureLoader().load(
  "https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/img/arrow.png"
);

const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* Attack arcs */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.2)
  .arcDashLength(0.4)
  .arcDashGap(4)
  .arcDashAnimateTime(3500)

  /* 🔥 REAL ARROWHEADS */
  .arcDirectionalParticles(2)
  .arcDirectionalParticleTexture(arrowTexture)
  .arcDirectionalParticleSpeed(0.02)
  .arcDirectionalParticleWidth(10)
  .arcDirectionalParticleColor(d => d.color)

  /* 🎯 Destination impact dots */
  .pointsData(liveAttacks)
  .pointLat(d => d.endLat)
  .pointLng(d => d.endLng)
  .pointColor(d => d.color)
  .pointRadius(0.15)
  .pointAltitude(0.01)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.4 })
  (globeContainer);

/* Auto rotation */
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* Generate attack */
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
    source: from.country,
    target: to.country,
    time: Date.now()
  };
}

/* Live updates */
setInterval(() => {
  liveAttacks.push(generateAttack());

  if (liveAttacks.length > 50) {
    liveAttacks.shift();
  }

  globe.arcsData(liveAttacks);
  globe.pointsData(liveAttacks);
}, 1000);
