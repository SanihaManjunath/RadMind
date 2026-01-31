const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");
const peakEl = document.getElementById("count-peak");

/* ================= METRICS ================= */
let totalToday = 0;
let attacksThisMinute = [];
let peakPerMinute = 0;

/* ================= HEAT RINGS ================= */
const heatRings = [];

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* ATTACK ARROWS */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(d => [0.2, 1.8])
  .arcAltitude(0.3)
  .arcDashLength(0.65)
  .arcDashGap(2)
  .arcDashInitialGap(() => Math.random() * 5)
  .arcDashAnimateTime(2800)

  /* TARGET GLOW */
  .ringsData(heatRings)
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.maxR)
  .ringPropagationSpeed(d => d.propagationSpeed)
  .ringRepeatPeriod(d => d.repeatPeriod)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.3 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;
globe.renderer().setPixelRatio(window.devicePixelRatio);

/* ================= GLOW ================= */
function addRegionHeat(attack) {
  heatRings.push({
    lat: attack.endLat,
    lng: attack.endLng,
    maxR: 3,
    propagationSpeed: 2,
    repeatPeriod: 700,
    color: attack.color
  });

  globe.ringsData(heatRings);
}

/* ================= PANELS ================= */
function updateTopTargets() {
  const counts = {};
  liveAttacks.forEach(a => {
    counts[a.target] = (counts[a.target] || 0) + 1;
  });

  targetsList.innerHTML = "";
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([country, count]) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${country}</span><span>${count}</span>`;
      targetsList.appendChild(li);
    });
}

function addToFeed(attack) {
  const li = document.createElement("li");
  const time = new Date(attack.time).toLocaleTimeString();

  li.innerHTML = `
    <span class="feed-time">[${time}]</span>
    <span class="feed-type" style="color:${attack.color}">
      ${attack.type}
    </span>
    | ${attack.source} → ${attack.target}
  `;

  feedList.prepend(li);
  if (feedList.children.length > 20) {
    feedList.removeChild(feedList.lastChild);
  }
}

/* ================= COUNTERS ================= */
function updateCounters() {
  totalToday++;
  todayEl.textContent = totalToday;
  activeEl.textContent = liveAttacks.length;

  const now = Date.now();
  attacksThisMinute.push(now);
  attacksThisMinute = attacksThisMinute.filter(t => now - t < 60000);

  if (attacksThisMinute.length > peakPerMinute) {
    peakPerMinute = attacksThisMinute.length;
    peakEl.textContent = peakPerMinute;
  }
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
    source: from.country,
    target: to.country,
    color: attack.color,
    type: attack.name,
    time: Date.now()
  };
}

/* ================= LIVE LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 18) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addRegionHeat(attack);
  updateTopTargets();
  addToFeed(attack);
  updateCounters();
}, 2000);
