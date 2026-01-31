const globeContainer = document.getElementById("globe-container");
const targetsList = document.getElementById("targets-list");
const feedList = document.getElementById("feed-list");

const todayEl = document.getElementById("count-today");
const activeEl = document.getElementById("count-active");

/* ================= METRICS ================= */
let totalToday = 0;

/* ================= HEAT RINGS ================= */
const heatRings = [];

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* ARROWS — COLOR FROM SINGLE SOURCE */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcAltitude(0.32)
  .arcStroke(0.6)
  .arcDashLength(0.18)
  .arcDashGap(0.8)
  .arcDashInitialGap(d => d._dashOffset)
  .arcDashAnimateTime(1800)

  /* TARGET RINGS — SAME COLOR */
  .ringsData(heatRings)
  .ringColor(d => d.color)
  .ringMaxRadius(d => d.maxR)
  .ringPropagationSpeed(d => d.speed)
  .ringRepeatPeriod(d => d.period)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.35 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.35;

/* ================= TARGET GLOW ================= */
function addRegionHeat(attack) {
  heatRings.push({
    lat: attack.endLat,
    lng: attack.endLng,
    maxR: 2.6,
    speed: 2.2,
    period: 700,
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

/* ================= CLEAN FEED ================= */
function addToFeed(attack) {
  const li = document.createElement("li");
  const time = new Date(attack.time).toLocaleTimeString();

  li.innerHTML = `
    <span class="feed-time">[${time}]</span>
    <span class="feed-path" style="color:${attack.color}">
      ${attack.source} → ${attack.target}
    </span>
  `;

  feedList.prepend(li);
  if (feedList.children.length > 30) {
    feedList.removeChild(feedList.lastChild);
  }
}

/* ================= COUNTERS ================= */
function updateCounters() {
  totalToday++;
  todayEl.textContent = totalToday;
  activeEl.textContent = liveAttacks.length;
}

/* ================= ATTACK GENERATOR ================= */
function generateAttack() {
  const attack =
    ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];

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
    color: attack.color,      // 🔑 SAME COLOR EVERYWHERE
    time: Date.now(),
    _dashOffset: Math.random() * 2
  };
}

/* ================= LIVE LOOP ================= */
setInterval(() => {
  const attack = generateAttack();
  liveAttacks.push(attack);
  if (liveAttacks.length > 20) liveAttacks.shift();

  globe.arcsData(liveAttacks);
  addRegionHeat(attack);
  updateTopTargets();
  addToFeed(attack);
  updateCounters();
}, 1800);
