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

/* ================= REGION HEAT STATE ================= */
const regionHeat = {};
const HEAT_DECAY = 0.02;

/* ================= COLOR UTILS ================= */
function rgba(hex, alpha) {
  const c = hex.replace("#", "");
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ================= GLOBE ================= */
const globe = Globe()
  .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
  .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")

  /* ATTACK ARCS */
  .arcsData(liveAttacks)
  .arcColor(d => d.color)
  .arcStroke(1.4)
  .arcAltitude(0.25)
  .arcDashLength(0.55)
  .arcDashGap(4)
  .arcDashAnimateTime(3200)

  /* 🌍 REGION HEAT GLOW */
  .pointsData([])
  .pointLat(d => d.lat)
  .pointLng(d => d.lng)

  /* Soft, non-linear radius */
  .pointRadius(d => Math.min(2.8, Math.pow(d.value, 0.6)))

  /* Transparent glow color */
  .pointColor(d => rgba(d.color, Math.min(0.85, d.value / 6)))

  .pointAltitude(0.01)
  .pointsMerge(true)

  .pointOfView({ lat: 20, lng: 0, altitude: 2.25 })
  (globeContainer);

globe.controls().autoRotate = true;
globe.controls().autoRotateSpeed = 0.32;

/* ================= CAMERA FOCUS ================= */
let isFocusing = false;

function focusOnAttack(attack) {
  if (isFocusing) return;
  isFocusing = true;
  globe.controls().autoRotate = false;

  globe.pointOfView(
    { lat: attack.endLat, lng: attack.endLng, altitude: 1.6 },
    1200
  );

  setTimeout(() => {
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.25 }, 1200);
    setTimeout(() => {
      globe.controls().autoRotate = true;
      isFocusing = false;
    }, 1200);
  }, 1500);
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

/* ================= HEAT MAP ================= */
function updateRegionHeat(attack) {
  if (!regionHeat[attack.target]) {
    const loc = LOCATIONS.find(l => l.country === attack.target);
    if (!loc) return;

    regionHeat[attack.target] = {
      lat: loc.lat,
      lng: loc.lng,
      value: 0,
      color: attack.color
    };
  }

  regionHeat[attack.target].value += 2.2;
  regionHeat[attack.target].color = attack.color;

  renderHeat();
}

function renderHeat() {
  Object.values(regionHeat).forEach(h => {
    h.value -= HEAT_DECAY;
    if (h.value < 0) h.value = 0;
  });

  globe.pointsData(
    Object.values(regionHeat).filter(h => h.value > 0.08)
  );
}

/* ================= ATTACK GENERATOR ================= */
function generateAttack() {
  const attack = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  let from = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  let to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
  while (from === to) to = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

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
  updateRegionHeat(attack);
  updateTopTargets();
  addToFeed(attack);
  updateCounters();
  focusOnAttack(attack);
}, 2000);

/* ================= PULSE ================= */
setInterval(renderHeat, 120);
