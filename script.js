const globeContainer = document.getElementById("globe-container");

const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  // Base arc
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.2)
  .arcDashLength(0.4)
  .arcDashGap(4)
  .arcDashAnimateTime(3000)

  // 🔥 DIRECTIONAL ARROWS
  .arcDirectionalParticles(4)
  .arcDirectionalParticleSpeed(0.015)
  .arcDirectionalParticleWidth(6)
  .arcDirectionalParticleColor(d => d.color)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.4 })
  (globeContainer);

// Auto rotate
globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

// Generate attack
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

// Live update loop
setInterval(() => {
  liveAttacks.push(generateAttack());

  if (liveAttacks.length > 60) {
    liveAttacks.shift();
  }

  globe.arcsData(liveAttacks);
}, 1000);
